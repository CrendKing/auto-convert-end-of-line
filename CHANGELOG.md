# 0.2.3

Update project repository URL

# 0.2.2

Simplify code

# 0.2.1

* Use the more reliable "onDidChangeActiveTextEditor" event, which triggers conversion whenever the active editor (tab) is switched
* Calculate target EOL only when the "files.eol" configuration is changed instead of before every conversion

# 0.2.0

* Change the EOL when file is opened instead of when it is saved, offering user a chance to undo the pending change
* Display notification if a EOL change from this extension is pending, and automatically dismiss itself after a few seconds

# 0.1.0

Initial release
