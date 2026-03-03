tell application "Mail"
    set latestMessages to (messages of inbox whose read status is false)
    set output to ""
    repeat with msg in latestMessages
        set output to output & "Subject: " & subject of msg & "\n"
        set output to output & "Sender: " & sender of msg & "\n"
        set output to output & "Content: " & (get text content of msg) & "\n---\n"
    end repeat
    return output
end tell
