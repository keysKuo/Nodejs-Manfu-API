use manfu


-- VIEW ALL FUNCTIONS
-- CURRENTLY 12
-- UPDATED 20/3/2023


-- VIEW BILL
CREATE FUNCTION FN_VIEW_BILL ()  
RETURNS TABLE  
AS  
RETURN (   
    SELECT *    
    FROM __BILL  
    )  

-- CALCULATE BILL
CREATE FUNCTION FN_CALCULATE_BILL (@bill_ID varchar(10))  
RETURNS TABLE  
AS  
RETURN (   
    SELECT SUM(price * quantity) AS total    
    FROM FN_VIEW_BILL_INFO(@bill_ID)   
    WHERE bill_ID = @bill_ID  
    )  

-- VIEW BILL HISTORY - DUNG
Create Function FN_VIEW_BILL_HISTORY (@date date, @start int, @end int)  
Returns Table  
As   
Return      
    Select * From __BILL     
    Where Convert(date,created_at) = Convert(date, @date)
    And DATEPART(hour, created_at) >= @start And DATEPART(hour, created_at) <= @end

-- VIEW BILL INFO - DUNG
Create Function FN_VIEW_BILL_INFO (@bill_ID varchar(10))  
Returns Table   
As  
Return       
    Select B.bill_ID, P.product_name, O.price, O.quantity, P.product_catery, B.created_at, B.total_price, B.is_completed      
    From __Product P, __Order O, __Bill B      
    Where B.bill_ID = O.bill_ID       
    And O.product_ID = P.product_ID       
    And O.order_status = 'success'       
    And B.bill_ID = @bill_ID  



-- VIEW MENU (CLIENT SIDE/AVAILABLE) - DUNG
Create function FN_GET_MENU_CLIENT ()  
Returns table   
As  
Return       
    Select * From __PRODUCT      
    Where is_available = 1

-- VIEW PRODUCT STORAGE - DUNG
Create Function FN_VIEW_PRODUCT_STORAGE ()  
Returns Table  
As   
Return      
    Select * From __PRODUCT

-- VIEW PRODUCT INFO BY ID - DUNG
Create Function FN_FIND_A_PRORDUCT_BY_ID (@pid varchar(10))  
Returns Table   
As   
Return       
    Select * From __PRODUCT      
    Where product_ID = @pid



--  REFRESH ORDER QUEUE (VIEW ORDER) - DUNG
Create function FN_REFRESH_ORDER_QUEUE ()  
Returns table  
As  
Return      
    Select P.product_name, O.* From __ORDER O , __PRODUCT P 
    Where O.product_ID = P.product_ID And O.order_status != 'success'
    AND O.order_status != 'cancel'

-- View Orders History - DUNG
Create Function FN_VIEW_ORDERS_HISTORY (@date Date)  
Returns Table  
As  
Return      
    Select * From __ORDER      
    Where created_at = @date



-- Find a Staff by ID - DUNG
Create Function FN_FIND_A_STAFF_BY_ID (@staff_ID varchar(10))  
Returns Table  
As  
Return      
    Select * From __STAFF      
    Where staff_ID = @staff_ID



-- Find an Account by ID - DUNG
Create Function FN_FIND_AN_ACCOUNT_BY_ID (@account_ID varchar(10))  
Returns Table   
As  
Return       
    Select * From __ACCOUNT      
    Where account_ID = @account_ID



-- VIEW ALL TABLES
CREATE FUNCTION FN_GET_ALL_TABLE ()  
RETURNS TABLE  
AS  
    RETURN (      
        SELECT *      
        FROM __TABLE  
        )


-- VIEW FOODS WHICH ARE ORDERED OF A TABLE (BILL)
Create Function FN_GET_ORDERING_BY_BILL (@bill_ID varchar(10))
Returns table 
As
Return 
    Select O.order_ID, P.product_ID, P.product_name, O.price, O.quantity, O.order_status, O.created_at FROM __ORDER O, __PRODUCT P
    Where P.product_ID = O.product_ID And O.bill_ID = @bill_ID
  



SELECT name, definition, type_desc 
FROM sys.sql_modules m 
INNER JOIN sys.objects o 
        ON m.object_id=o.object_id
WHERE type_desc like '%function%'
