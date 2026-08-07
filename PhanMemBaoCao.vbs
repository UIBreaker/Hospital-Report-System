Set WshShell = CreateObject("WScript.Shell")
Dim fso
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetAbsolutePathName(".")

' Chạy file SilentStart.bat ẩn (tham số 0 là ẩn cửa sổ)
WshShell.Run """" & currentDir & "\SilentStart.bat""", 0, False
