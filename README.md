# Discord Dragonbot
JS版Dragonbot
## TODO
+ base
    + [ ] `dragonBot` - ?優化init
    + [ ] ?`prefixCommand` - prefix command 模板
+ helpers
    + [x] `logger`
    + [x] `database` - ~~postgreSQL~~、redis
+ commands
    + [ ] ?`music` - 音樂
    + slash command - ?指令分類
        + [ ] `subscribe` - 訂閱系統（WIP）
        + [x] `reload` - 重載
    + ?prefix command
        + [ ] `imgur` - 上傳圖片到imgur
        + [ ] `load` - 重載
        + [ ] `book` - 本本網址管理
+ events
    + [ ] `messageCreate` - ...
## 已知問題
+ register command時為了傳入client，無法使用registerCommandIn和直接reload指令('可能'影響效率，考慮直接export client)