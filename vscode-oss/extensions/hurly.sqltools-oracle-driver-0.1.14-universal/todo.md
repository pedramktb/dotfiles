1. sql和对应的查询结果有对应关系
https://github.com/cmoog/vscode-sql-notebook
还挺有意思，但是不能输出全部内容

一个block对应一个connection

最终解决方式:不修改代码，修改配置,reuse tab选择connection,如果有多个select，写在一个block中

2. 补全提示能够对每个block独立处理

又看了下vscode-sqltools，现在还做不了，使用的hueAst对oracle中的(+)支持不好

3. 某些sql能够在sqlplus执行

4. 不能够准确分块的sql语句优化

5. 查询结果  进一步查询能显示搜索数目  



plsql 块的写法


begin
if 
end



统计sql执行时间