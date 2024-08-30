Sub CopyOrAppendFile(sourceFilePath, targetFilePath, appendMode)
    Dim fso, sourceFile, targetFile
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    If fso.FileExists(sourceFilePath) Then
        Set sourceFile = fso.OpenTextFile(sourceFilePath, 1) ' 1 = ForReading
        
        Dim fileContent
        fileContent = sourceFile.ReadAll
        
        sourceFile.Close
        
        Dim openMode
        If appendMode Then
            openMode = 8 ' ForAppending
        Else
            openMode = 2 ' ForWriting
        End If
        
        EnsureFolderExists(targetFilePath)
        Set targetFile = fso.OpenTextFile(targetFilePath, openMode, True)
        targetFile.Write fileContent
        targetFile.Close
        
        If appendMode Then
            WScript.Echo "Content successfully appended to " & targetFilePath
        Else
            WScript.Echo "Content successfully written to " & targetFilePath
        End If
    Else
        WScript.Echo "The source file does not exist: " & sourceFilePath
    End If
End Sub

Sub EnsureFolderExists(filePath)
    Dim fso, folderPath, folder
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    folderPath = fso.GetParentFolderName(filePath)
    
    If Not fso.FolderExists(folderPath) Then
        fso.CreateFolder(folderPath)
        WScript.Echo "Folder created: " & folderPath
    Else
        WScript.Echo "Folder already exists: " & folderPath
    End If
End Sub

' Copy all the data in target-file
Call CopyOrAppendFile("./src/utils/saveGlobalNames.util.js", "./dist/scroll-timeline.js", False)
Call CopyOrAppendFile("./src/utils/createClass.util.js", "./dist/scroll-timeline.js", True)
Call CopyOrAppendFile("./src/classes/CSSParser.js", "./dist/scroll-timeline.js", True)
Call CopyOrAppendFile("./src/classes/AnimationTimeline.js", "./dist/scroll-timeline.js", True)
Call CopyOrAppendFile("./main.js", "./dist/scroll-timeline.js", True)
