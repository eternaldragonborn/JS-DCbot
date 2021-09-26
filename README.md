# Discord Dragonbot
JS版Dragonbot
## TODO
+ base
    + [ ] `dragonBot` - ?優化init
    + [ ] ?`prefixCommand` - prefix command 模板
+ helpers
    + [x] `logger`
    + [ ] `database` - postgreSQL、redis
+ commands
    + slash command - ?指令分類
        + [ ] `subscribe` - 訂閱系統
        + [ ] `book` - 本本網址管理
        + [ ] ?`music` - 音樂
        + [ ] `load` - 重載（WIP）
    + ?prefix command
        + [ ] `imgur` - 上傳圖片到imgur
+ events
    + [ ] `messageCreate` - ...
## 已知問題
+ reload event之後使用任何指令都會被視為執行二次，造成unknown interaction
+ interactionCreate catch不明錯誤