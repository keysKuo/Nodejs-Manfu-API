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
	role varchar(255) check (role in ('chef', 'waiter', 'manager')),
	image_link varchar(255) null,
	
	is_available BIT,
	constraint PK_STAFF primary key (staff_ID)
)


create table __ACCOUNT(
	account_ID varchar(10) Primary key,
	account_password varchar(10),
	is_available bit,
	staff_ID varchar(10),

	constraint FK_ACCOUNT_STAFF foreign key (staff_ID) references __STAFF(staff_ID)
)


create table __TABLE (
	table_ID varchar(10),
	table_seat int,
	is_available bit,
	
	constraint PK_TABLE primary key (table_ID),
)


create table __BILL(
	bill_ID varchar(10),
	total_price int,
	created_at datetime,
	is_completed bit,
	table_ID varchar(10),
    staff_ID varchar(10),
	constraint PK_BILL primary key (bill_ID),
	constraint FK_BILL_TABLE foreign key (table_ID) references __TABLE(table_ID),
	constraint FK_BILL_STAFF foreign key (staff_ID) references __STAFF(staff_ID)
)


create table __ORDER (
	order_ID varchar(10),
	created_at datetime,
	product_ID varchar(10),
    price int,
    quantity int,
    order_status varchar(10) check (order_status in ('success', 'cancel', 'waiting', 'preparing')),
	order_priority int,
	table_ID varchar(10),
	bill_ID varchar(10),  

	constraint PK_ORDER primary key (order_ID),
	constraint FK_ORDER_TABLE foreign key (table_ID) references __TABLE(table_ID),
	constraint FK_ORDER_PRODUCT foreign key (product_ID) references __PRODUCT(product_ID),
	constraint FK_ORDER_BILL foreign key (bill_ID) references __BILL(bill_ID)
)


-----------------------------------------------------------


--ticket_priority = 10, extra_priority = 9, vegatable_priority = 8
--buffet_priority = 7-5, alacarte_priority = 4-2
--1-0 are extra priority values
--buffet will have the price be 0
insert into __PRODUCT (product_ID, product_name, product_category, product_price, product_priority, is_available, image_link) 
values ('TK00000001', N'ticket buffet lẩu','ticket', 500000, 10, 1, null)
insert into __PRODUCT values ('EX00000001', N'khăn lạnh', 'extra',5000, 9, 1, null)
insert into __PRODUCT values ('FD00000001', N'bò tái','buffet', 50000, 5, 1, null)
insert into __PRODUCT values ('AL00000001', N'bò xào ngũ vị', 'alacarte', 75000, 4, 1, null)
insert into __PRODUCT values ('AL00000002', N'bò xào tam vị', 'alacarte', 35000, 3, 0, null)
--select * from __PRODUCT


insert into __STAFF (staff_ID, staff_name, join_date, role, is_available) 
values ('EMP0000001', N'Nguyên Văn A', getdate(), 'manager', 1)
insert into __STAFF values ('EMP0000002', N'Nguyên Văn B', getdate(), 'manager', null, 1)
insert into __STAFF values ('EMP0000003', N'Nguyên Văn C', getdate(), 'waiter', null, 1)
insert into __STAFF values ('EMP0000004', N'Nguyên Văn D', getdate(), 'chef', null, 0)
insert into __STAFF values ('EMP0000005', N'Nguyên Văn E', getdate(), 'chef', null, 1)
--select * from __STAFF


insert into __ACCOUNT (account_ID, account_password, is_available, staff_ID)
values ('AC00000001', '123456', 1, 'EMP0000001')
insert into __ACCOUNT values ('AC00000002', '123456', 0, 'EMP0000002')
--select * from __ACCOUNT


insert into __TABLE (table_ID, table_seat, is_available) 
values ('TAB0000001', 4, 1)
insert into __TABLE values ('TAB0000002', 8, 1)
insert into __TABLE values ('TAB0000003', 10, 1)
select * from __TABLE
update __TABLE set is_available = 1 where table_ID = 'TAB0000004'


insert into __BILL values ('B0001', 2000000, GETDATE(), 0, 'TAB0000001', 'EMP0000005')
select * from __BILL
delete from __BILL where bill_ID = 'Bf0df2548-'

insert into __ORDER values ('OD00000001', GETDATE(), 'FD00000001', 50000, 2, 'waiting', 5, 'TAB0000001', 'B0001')
insert into __ORDER values ('OD00000002', GETDATE(), 'AL00000001', 150000, 3, 'waiting', 6, 'TAB0000001', 'B0001')
insert into __ORDER values ('OD00000000', GETDATE(), 'AL00000001', 150000, 3, 'cancel', 6, 'TAB0000001', 'B0001')
select * from __ORDER ORDER BY order_priority desc, created_at asc
--delete from __ORDER 
update __ORDER set order_status = 'waiting' where order_ID = 'OD00000001'


delete from __PRODUCT where product_ID = 'EX00000002'
select * from __PRODUCT where product_ID = 'EX00000002'
select * from __PRODUCT where image_link is null or image_link = ''

--update __TABLE set is_available = 0 where table_ID = 'TAB0000004'
--select * from __TABLE
--update __BILL set is_completed = 0 where bill_ID = 'B39924603-'
--select * from __BILL