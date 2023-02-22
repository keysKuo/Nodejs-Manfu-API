create database manfu
--drop database manfu
use manfu

-----------------------------------------------------------

create table __PRODUCT (
	product_ID varchar(10),
	product_name nvarchar(255) not null,
	product_category varchar(10) check (product_category in ('buffet', 'alacarte', 'ticket', 'extra')),
	product_price int,
	product_priority int,
	is_available bit, --1 is true and 0 is false
	image_link varchar(255)

	constraint PK_FOOD primary key (product_ID)
)

create table __STAFF(
	staff_ID varchar(10),
	staff_name nvarchar(255),
	
	join_date datetime,
	roles varchar(255) check (roles in ('chef', 'staff', 'manager', 'admin')),
	image_link varchar(255) null,
	password varchar(255) null,
	is_available BIT,
	constraint PK_STAFF primary key (staff_ID)
)

create table __TABLE (
	table_ID varchar(10),
	table_seat int,
	is_available bit,
	--bill_ID varchar(10),
	staff_ID varchar(10),

	constraint PK_TABLE primary key (table_ID),
	--constraint FK_TABLE_BILL foreign key (bill_ID) references __BILL(bill_ID),
	constraint FK_TABLE_STAFF foreign key (staff_ID) references __STAFF(staff_ID)
)

create table __BILL(
	bill_ID varchar(10),
	total_price int,
	created_at datetime,
	table_ID varchar(10),

	constraint PK_BILL primary key (bill_ID),
	constraint FK_BILL_TABLE foreign key (table_ID) references __TABLE(table_ID)
)

create table __ORDER (
	order_ID varchar(10),
	created_at datetime,
	updated_at datetime,
	table_ID varchar(10),

	constraint PK_ORDER primary key (order_ID),
	constraint FK_ORDER_TABLE foreign key (table_ID) references __TABLE(table_ID)
)

create table __ORDER_DETAIL (
	order_ID varchar(10),
	product_ID varchar(10),
	quantity int,
	price int,
	product_status varchar(10) check (product_status in ('success', 'cancel', 'idle')),
	product_priority int,

	constraint PK_ORDER_DETAIL primary key (product_ID, order_ID),
	constraint FK_ORDER_DETAIL_PRODUCT foreign key (product_ID) references __PRODUCT(product_ID),
	constraint FK_ORDER_DETAIL_ORDER foreign key (order_ID) references __ORDER(order_ID)
)

-----------------------------------------------------------

--ticket_priority = 10, extra_priority = 9, vegatable_priority = 8
--buffet_priority = 7-5, alacarte_priority = 4-2
--so 1-0 are extra
insert into __PRODUCT (product_ID, product_name, product_category, product_price, product_priority, is_available) 
values ('TK000001', N'ticket buffet lẩu','ticket', 500000, 10, 1)
insert into __PRODUCT values ('EX000001', N'khăn lạnh', 'extra',5000, 9, 1, null)
insert into __PRODUCT values ('FD000001', N'bò tái','buffet', 50000, 5, 1, null)
insert into __PRODUCT values ('AL000001', N'bò xào ngũ vị', 'alacarte', 75000, 4, 1, null)
insert into __PRODUCT values ('AL000002', N'bò xào tam vị', 'alacarte', 35000, 3, 0, null)

--

insert into __STAFF (staff_ID, staff_name, join_date, roles, is_available) 
values ('EMP0000001', N'Nguyên Văn A', getdate(), 'admin', 1)
insert into __STAFF values ('EMP0000002', N'Nguyên Văn B', getdate(), 'manager', null, null, 1)
insert into __STAFF values ('EMP0000003', N'Nguyên Văn C', getdate(), 'staff', null, null, 1)
insert into __STAFF values ('EMP0000004', N'Nguyên Văn D', getdate(), 'chef', null, null, 0)
insert into __STAFF values ('EMP0000005', N'Nguyên Văn E', getdate(), 'chef', null, null, 1)
select * from __STAFF

--

--delete from __TABLE
insert into __TABLE (table_ID, table_seat, is_available, staff_ID) 
values ('TAB0000001', 4, 0, 'EMP0000003')
insert into __TABLE values ('TAB0000002', 8, 1, 'EMP0000003')
insert into __TABLE values ('TAB0000003', 10, 1, 'EMP0000003')
select * from __TABLE

--

insert into __BILL (bill_ID, total_price, created_at, table_id) 
values ('BIL0000001', 0, GETDATE(), 'TAB0000001')
insert into __BILL values ('BIL0000002', 0, GETDATE(), 'TAB0000002')
insert into __BILL values ('BIL0000003', 0, GETDATE(), 'TAB0000003')

--

--delete from __ORDER
insert into __ORDER (order_ID, created_at, updated_at, table_ID) 
values ('OR00000001', GETDATE(), null, 'TAB0000001')
insert into __ORDER values ('OR00000002', GETDATE(), null, 'TAB0000001')
insert into __ORDER values ('OR00000003', GETDATE(), null, 'TAB0000001')
select * from __ORDER

--

--delete from __ORDER_DETAIL
insert into __ORDER_DETAIL (order_ID, product_ID, quantity, price, product_status, product_priority) 
values ('OR00000001', 'AL000001', 5, 75000, 'idle', 4)
insert into __ORDER_DETAIL values ('OR00000001', 'TK000001', 1, 500000, 'success', 10)

insert into __ORDER_DETAIL values ('OR00000002', 'TK000001', 2, 500000, 'success', 10)
insert into __ORDER_DETAIL values ('OR00000002', 'AL000001', 5, 75000, 'idle', 4)
insert into __ORDER_DETAIL values ('OR00000002', 'FD000001', 5, 75000, 'idle', 5)

insert into __ORDER_DETAIL values ('OR00000003', 'TK000001', 3, 500000, 'success', 10)
insert into __ORDER_DETAIL values ('OR00000003', 'FD000001', 5, 75000, 'idle', 6)
insert into __ORDER_DETAIL values ('OR00000003', 'EX000001', 5, 75000, 'idle', 9)
select * from __ORDER_DETAIL

-----------------------------------------------------------

--procedure to increate the priority
--drop trigger TABLE_BILL_HANDLER
go
create trigger TABLE_BILL_HANDLER 
on __BILL
for insert
as 
begin
	declare @table_id_inserted varchar(10)
	declare @status int
	
	select @table_id_inserted = table_id from inserted
	select @status = __TABLE.is_available from __TABLE where __TABLE.table_ID = @table_id_inserted
	if(@status = 0)
	begin
		print N'BÀN ĐÃ CÓ BILL RỒI'
		rollback tran
	end
end

-----------------------------------------------------------

select  OD.*, O.created_at
from __ORDER_DETAIL OD, __ORDER O
where O.order_ID = OD.order_ID 
	and OD.product_status = 'idle'
order by OD.product_priority desc, O.created_at asc



--select * from __BILL
--select * from __TABLE

--insert into __BILL values ('BIL0000004', 0, GETDATE(), 'TAB0000001')

--select t1.order_ID, t2.product_ID, t2.quantity, t2.price, t2.product_status, t2.product_priority, t1.created_at 
--from (
--	Select order_ID, O.created_at 
--	From __ORDER O, __TABLE T, __BILL B 
--	Where O.table_ID = T.table_ID AND B.table_ID = T.table_ID AND B.bill_ID = 'BIL0000001'
--) t1 
--inner join
--(
--	select * 
--	from __ORDER_DETAIL
--) t2
--ON t1.order_ID = t2.order_ID
--order by t1.order_ID asc

--alter table __PRODUCT
--ADD image_link varchar(255)
--select * from __PRODUCT

--update __STAFF
--set password = '$2a$10$BG7NfEFw9jA8jG9GvPTtxu/6HJU51xWLB27U8PivXjbY4hbtiVYzG'

--drop database manfu