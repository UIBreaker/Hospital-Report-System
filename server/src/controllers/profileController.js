const pool = require('../config/db');

/**
 * GET /api/auth/profile
 * Get current user profile details, operational statistics & accessible custom forms
 */
const getProfile = async (req, res, next) => {
  try {
    const { userId, username, departmentCode, role, source } = req.user;

    let userRecord = null;
    let isSystemUser = source === 'system';

    if (isSystemUser) {
      const [sysUsers] = await pool.execute(
        `SELECT id, username, full_name, role, department_code, department_name, 
                avatar_url, phone, email, certificate, position, signature_url, bio, 
                status, last_login_at, created_at 
         FROM system_users WHERE id = ? OR username = ?`,
        [userId, username]
      );
      if (sysUsers.length > 0) {
        userRecord = sysUsers[0];
      }
    }

    if (!userRecord) {
      const [coreUsers] = await pool.execute(
        `SELECT id, username, full_name, role, department_code, department_name, 
                avatar_url, phone, email, certificate, position, signature_url, bio, 
                created_at 
         FROM users WHERE id = ? OR username = ?`,
        [userId, username]
      );
      if (coreUsers.length > 0) {
        userRecord = coreUsers[0];
        isSystemUser = false;
      }
    }

    if (!userRecord) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thông tin tài khoản' });
    }

    // Standardize user object
    const profile = {
      id: userRecord.id,
      username: userRecord.username,
      full_name: userRecord.full_name || userRecord.department_name || userRecord.username,
      role: (userRecord.role || role || 'staff').toLowerCase(),
      departmentCode: userRecord.department_code || departmentCode,
      departmentName: userRecord.department_name || '',
      avatar_url: userRecord.avatar_url || '',
      phone: userRecord.phone || '',
      email: userRecord.email || '',
      certificate: userRecord.certificate || '',
      position: userRecord.position || '',
      signature_url: userRecord.signature_url || '',
      bio: userRecord.bio || '',
      status: userRecord.status || 'active',
      last_login_at: userRecord.last_login_at || null,
      created_at: userRecord.created_at || null,
      source: isSystemUser ? 'system' : 'core'
    };

    // 1. Calculate operational stats
    let totalReports = 0;
    let totalCustomSubmissions = 0;
    let totalCases = 0;

    try {
      if (profile.departmentCode && profile.departmentCode !== 'personal') {
        const [repCount] = await pool.execute(
          'SELECT COUNT(*) AS count FROM reports WHERE department_code = ?',
          [profile.departmentCode]
        );
        totalReports = repCount[0]?.count || 0;

        // Count cases
        const [c1] = await pool.execute(
          'SELECT COUNT(*) AS count FROM transfer_cases tc JOIN reports r ON tc.report_id = r.id WHERE r.department_code = ?',
          [profile.departmentCode]
        );
        const [c2] = await pool.execute(
          'SELECT COUNT(*) AS count FROM surgery_cases sc JOIN reports r ON sc.report_id = r.id WHERE r.department_code = ?',
          [profile.departmentCode]
        );
        const [c3] = await pool.execute(
          'SELECT COUNT(*) AS count FROM critical_cases cc JOIN reports r ON cc.report_id = r.id WHERE r.department_code = ?',
          [profile.departmentCode]
        );
        const [c4] = await pool.execute(
          'SELECT COUNT(*) AS count FROM death_cases dc JOIN reports r ON dc.report_id = r.id WHERE r.department_code = ?',
          [profile.departmentCode]
        );

        totalCases = (c1[0]?.count || 0) + (c2[0]?.count || 0) + (c3[0]?.count || 0) + (c4[0]?.count || 0);
      }
    } catch (statErr) {
      console.warn('Could not compute department report stats:', statErr.message);
    }

    try {
      const [customCount] = await pool.execute(
        'SELECT COUNT(*) AS count FROM custom_form_submissions WHERE submitted_by_user = ? OR department_code = ?',
        [profile.username, profile.departmentCode]
      );
      totalCustomSubmissions = customCount[0]?.count || 0;
    } catch (subErr) {
      console.warn('Could not compute custom form stats:', subErr.message);
    }

    // 2. Fetch accessible forms and permission breakdown for this user
    let accessibleForms = [];
    try {
      const [forms] = await pool.execute(
        `SELECT cf.id, cf.code, cf.title, cf.description, cf.form_type, cf.theme_color, cf.is_active,
                (SELECT COUNT(*) FROM custom_form_submissions cfs WHERE cfs.form_id = cf.id) AS total_submissions
         FROM custom_forms cf
         WHERE cf.is_active = 1
         ORDER BY cf.created_at DESC`
      );

      const [permissions] = await pool.execute('SELECT * FROM custom_form_permissions');

      accessibleForms = forms.map(f => {
        const formPerms = permissions.filter(p => p.form_id === f.id);
        let userPerm = 'none';

        if (profile.role === 'admin') {
          userPerm = 'edit';
        } else if (formPerms.length === 0) {
          userPerm = 'edit';
        } else {
          const directUser = formPerms.find(p => p.target_type === 'user' && p.target_value === profile.username);
          if (directUser) {
            userPerm = directUser.permission;
          } else {
            const deptPerm = formPerms.find(p => p.target_type === 'department' && p.target_value === profile.departmentCode);
            if (deptPerm) {
              userPerm = deptPerm.permission;
            } else {
              const rolePerm = formPerms.find(p => p.target_type === 'role' && (p.target_value === profile.role || p.target_value === 'staff' || p.target_value === 'personal'));
              if (rolePerm) {
                userPerm = rolePerm.permission;
              } else {
                const allPerm = formPerms.find(p => p.target_type === 'all');
                if (allPerm) {
                  userPerm = allPerm.permission;
                }
              }
            }
          }
        }

        return {
          ...f,
          userPermission: userPerm // 'edit', 'view', or 'none'
        };
      }).filter(f => f.userPermission !== 'none');
    } catch (permErr) {
      console.warn('Could not compute accessible forms:', permErr.message);
    }

    res.json({
      success: true,
      data: {
        profile,
        stats: {
          totalReports,
          totalCustomSubmissions,
          totalCases,
          totalFormsAccessible: accessibleForms.length,
          editableFormsCount: accessibleForms.filter(f => f.userPermission === 'edit').length,
          viewOnlyFormsCount: accessibleForms.filter(f => f.userPermission === 'view').length
        },
        accessibleForms
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Update user general profile information
 */
const updateProfile = async (req, res, next) => {
  try {
    const { userId, username, source } = req.user;
    const { full_name, phone, email, certificate, position, bio } = req.body;

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ success: false, error: 'Họ và tên không được để trống' });
    }

    const cleanFullName = String(full_name).trim();
    const cleanPhone = phone ? String(phone).trim() : null;
    const cleanEmail = email ? String(email).trim() : null;
    const cleanCert = certificate ? String(certificate).trim() : null;
    const cleanPos = position ? String(position).trim() : null;
    const cleanBio = bio ? String(bio).trim() : null;

    let updated = false;

    if (source === 'system') {
      const [result] = await pool.execute(
        `UPDATE system_users 
         SET full_name = ?, phone = ?, email = ?, certificate = ?, position = ?, bio = ?, updated_at = NOW()
         WHERE id = ? OR username = ?`,
        [cleanFullName, cleanPhone, cleanEmail, cleanCert, cleanPos, cleanBio, userId, username]
      );
      if (result.affectedRows > 0) updated = true;
    }

    if (!updated) {
      const [resultCore] = await pool.execute(
        `UPDATE users 
         SET full_name = ?, phone = ?, email = ?, certificate = ?, position = ?, bio = ?
         WHERE id = ? OR username = ?`,
        [cleanFullName, cleanPhone, cleanEmail, cleanCert, cleanPos, cleanBio, userId, username]
      );
      if (resultCore.affectedRows > 0) updated = true;
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin hồ sơ thành công',
      data: {
        full_name: cleanFullName,
        phone: cleanPhone,
        email: cleanEmail,
        certificate: cleanCert,
        position: cleanPos,
        bio: cleanBio
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/profile/avatar
 * Update user avatar URL
 */
const updateAvatar = async (req, res, next) => {
  try {
    const { userId, username, source } = req.user;
    const { avatar_url } = req.body;

    if (!avatar_url || typeof avatar_url !== 'string') {
      return res.status(400).json({ success: false, error: 'Đường dẫn ảnh đại diện không hợp lệ' });
    }

    const cleanAvatar = avatar_url.trim();

    let updated = false;
    if (source === 'system') {
      const [result] = await pool.execute(
        'UPDATE system_users SET avatar_url = ?, updated_at = NOW() WHERE id = ? OR username = ?',
        [cleanAvatar, userId, username]
      );
      if (result.affectedRows > 0) updated = true;
    }

    if (!updated) {
      await pool.execute(
        'UPDATE users SET avatar_url = ? WHERE id = ? OR username = ?',
        [cleanAvatar, userId, username]
      );
    }

    res.json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: { avatar_url: cleanAvatar }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/profile/signature
 * Update user digital signature template
 */
const updateSignature = async (req, res, next) => {
  try {
    const { userId, username, source } = req.user;
    const { signature_url } = req.body;

    const cleanSig = signature_url ? String(signature_url).trim() : null;

    let updated = false;
    if (source === 'system') {
      const [result] = await pool.execute(
        'UPDATE system_users SET signature_url = ?, updated_at = NOW() WHERE id = ? OR username = ?',
        [cleanSig, userId, username]
      );
      if (result.affectedRows > 0) updated = true;
    }

    if (!updated) {
      await pool.execute(
        'UPDATE users SET signature_url = ? WHERE id = ? OR username = ?',
        [cleanSig, userId, username]
      );
    }

    res.json({
      success: true,
      message: cleanSig ? 'Đã lưu chữ ký điện tử mẫu thành công' : 'Đã xóa chữ ký mẫu',
      data: { signature_url: cleanSig }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  updateSignature
};
