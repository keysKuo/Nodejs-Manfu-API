Create function FN_GET_MENU_CLIENT ()
Returns table 
As
Return 
    Select * From __PRODUCT
    Where is_available = 1
    


Create function FN_REFRESH_ORDER_QUEUE ()
Returns table
As
Return
    Select * From __ORDER           