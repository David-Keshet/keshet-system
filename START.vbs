Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

dir = fso.GetParentFolderName(WScript.ScriptFullName)
url = "http://localhost:3000"

' Kill old servers
sh.Run "taskkill /F /IM node.exe", 0, True
WScript.Sleep 2000

' Start server (hidden)
sh.CurrentDirectory = dir
sh.Run "cmd /c npm start", 0, False

' Wait for server to start
WScript.Sleep 3000

' Open as PWA in Edge (app mode - looks like desktop app)
On Error Resume Next
sh.Run "msedge.exe --app=" & url, 1, False
If Err.Number <> 0 Then
    ' Edge not found, try default browser
    sh.Run "cmd /c start " & url, 0, False
End If
On Error Goto 0
