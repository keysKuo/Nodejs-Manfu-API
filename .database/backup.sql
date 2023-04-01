--create database manfu
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


----------------------------------------------------------------------------------------------------------------------


--ticket_priority = 10, 
--extra_priority = 9, 
--vegatable_priority = 8
--buffet_priority = 7-5, 
--alacarte_priority = 4-2
--1-0 are extra priority values
--buffet will have the price be 0

--select * from __PRODUCT
--delete from __Product

-- Extra --
insert into __PRODUCT values ('EX0001', N'Vé buffet buổi trưa','extra', 399000, 10, 1, null)
insert into __PRODUCT values ('EX0002', N'Vé buffet buổi tối','extra', 449000, 10, 1, null)
insert into __PRODUCT values ('EX0003', N'Vé buffet quầy line','extra', 49000, 10, 1, null)
insert into __PRODUCT values ('EX0004', N'Vé buffet bia','extra', 89000, 10, 1, null)
insert into __PRODUCT values ('EX0005', N'Khăn lạnh', 'extra',5000, 9, 1, null)

-- Alacarte --
insert into __PRODUCT values ('AL0001', N'Mì xào hải sản', 'alacarte', 150000, 2, 1, null)
insert into __PRODUCT values ('AL0002', N'Cơm chiên cá mặn', 'alacarte', 176000, 2, 1, null)
insert into __PRODUCT values ('AL0003', N'Mực xào sa tế', 'alacarte', 190000, 2, 1, null)
insert into __PRODUCT values ('AL0004', N'Đậu hủ chiên giòn', 'alacarte', 60000, 3, 1, null)
insert into __PRODUCT values ('AL0005', N'Cải thìa xào xì dầu', 'alacarte', 60000, 3, 1, null)
insert into __PRODUCT values ('AL0006', N'Cá diêu hồng hấp hongkong', 'alacarte', 250000, 2, 1, null)

-- Buffet --
insert into __PRODUCT values ('BF0001', N'Nạc vai heo', 'buffet', 0, 4, 1, null)
insert into __PRODUCT values ('BF0002', N'Gầu bò hoa trứng', 'buffet', 0, 4, 1, null)
insert into __PRODUCT values ('BF0003', N'Sủi cảo tôm', 'buffet', 0, 4, 1, null)
insert into __PRODUCT values ('BF0004', N'Đầu cá hồi', 'buffet', 0, 5, 1, null)
insert into __PRODUCT values ('BF0005', N'Mề gà', 'buffet', 0, 4, 1, null)
insert into __PRODUCT values ('BF0006', N'Ba chỉ bò úc', 'buffet', 0, 5, 1, null)

insert into __STAFF (staff_ID, staff_name, join_date, role, is_available) 
values ('EMP0000001', N'Nguyên Văn A', getdate(), 'manager', 1)
insert into __STAFF values ('EMP0000002', N'Nguyên Văn B', getdate(), 'manager', null, 1)
insert into __STAFF values ('EMP0000003', N'Nguyên Văn C', getdate(), 'waiter', null, 1)
insert into __STAFF values ('EMP0000004', N'Nguyên Văn D', getdate(), 'chef', null, 0)
insert into __STAFF values ('EMP0000005', N'Nguyên Văn E', getdate(), 'chef', null, 1)
--select * from __STAFF


insert into __ACCOUNT (account_ID, account_password, is_available, staff_ID)
values ('KC001', '9952811', 1, 'EMP0000004')
insert into __ACCOUNT values ('MN001', '9952811', 1, 'EMP0000002')
insert into __ACCOUNT values ('ST001', '9952811', 1, 'EMP0000003')
--select * from __ACCOUNT


insert into __TABLE (table_ID, table_seat, is_available) values ('B1', 4, 1)
insert into __TABLE values ('B2', 8, 1)
insert into __TABLE values ('B3', 4, 1)
insert into __TABLE values ('B4', 4, 1)
insert into __TABLE values ('B5', 8, 1)
insert into __TABLE values ('B6', 10, 1)

--update __table set is_available = 1
--delete From __ORder
--delete From __BILL
--update __Product set product_price = 0 where product_category = 'buffet'

--select * FROM __BILL


--delete from __PRODUCT where product_ID = 'EX00000002'
--select * from __PRODUCT where product_ID = 'EX00000002'
--select * from __PRODUCT where image_link is null or image_link = ''


--update __TABLE set is_available = 0 where table_ID = 'TAB0000004'
--select * from __TABLE
--update __BILL set is_completed = 0 where bill_ID = 'B39924603-'
--select * from __BILL

