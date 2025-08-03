SELECT t.table_name || ' ' || t.column_name 
        || ' ' || upper(t.DATA_TYPE || 
         decode(t.DATA_LENGTH,null,'',
           '(' || t.DATA_LENGTH || decode(t.DATA_PRECISION,null,'', 
                                          ',' || t.DATA_PRECISION) || ')')) as hoverResult 
  FROM all_tab_columns t WHERE lower(t.column_name) = '#SEARCH'