
-- View Menu Client
Create function FN_GET_MENU_CLIENT ()
Returns table 
As
Return 
    Select * From __PRODUCT
    Where is_available = 1
    

--  Refresh Order Queue (View Orders)
--drop function FN_REFRESH_ORDER_QUEUE
Create function FN_REFRESH_ORDER_QUEUE ()
Returns table
As
Return
    Select P.product_name , O.* From __ORDER O, __PRODUCT P
	Where P.product_ID = O.product_ID
	And O.order_status != 'success' And O.order_status != 'cancel'


-- View Product Storage
Create Function FN_VIEW_PRODUCT_STORAGE ()
Returns Table
As 
Return
    Select * From __PRODUCT

-- Find a Product by ID
Create Function FN_FIND_A_PRORDUCT_BY_ID (@pid varchar(10))
Returns Table 
As 
Return 
    Select * From __PRODUCT
    Where product_ID = @pid
    
-- View Orders History
Create Function FN_VIEW_ORDERS_HISTORY (@date Date)
Returns Table
As
Return
    Select * From __ORDER
    Where created_at = @date

-- View Bill History
Create Function FN_VIEW_BILL_HISTORY (@date Date)
Returns Table
As 
Return
    Select * From __BILL 
    Where created_at = @date

-- Find a Staff by ID
Create Function FN_FIND_A_STAFF_BY_ID (@staff_ID varchar(10))
Returns Table
As
Return
    Select * From __STAFF
    Where staff_ID = @staff_ID

-- Find an Account by ID
Create Function FN_FIND_AN_ACCOUNT_BY_ID (@account_ID varchar(10))
Returns Table 
As
Return 
    Select * From __ACCOUNT
    Where account_ID = @account_ID

-- View Bill info
Create Function FN_VIEW_BILL_INFO (@bill_ID varchar(10))
Returns Table 
As
Return 
    Select B.bill_ID, P.product_name, O.price, O.quantity, B.created_at, B.total_price
    From __Product P, __Order O, __Bill B
    Where B.bill_ID = O.bill_ID 
    And O.product_ID = P.product_ID 
    And O.order_status = 'success' 
    And B.bill_ID = @bill_ID

