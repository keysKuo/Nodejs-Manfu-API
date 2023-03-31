

function incrementValue(e) {
    e.preventDefault();
    var fieldName = $(e.target).data('field');
    var parent = $(e.target).closest('div');
    var currentVal = parseInt(parent.find('input[name=' + fieldName + ']').val(), 10);

    if (!isNaN(currentVal)) {
        parent.find('input[name=' + fieldName + ']').val(currentVal + 1);
    } else {
        parent.find('input[name=' + fieldName + ']').val(0);
    }
}

function decrementValue(e) {
    e.preventDefault();
    var fieldName = $(e.target).data('field');
    var parent = $(e.target).closest('div');
    var currentVal = parseInt(parent.find('input[name=' + fieldName + ']').val(), 10);

    if (!isNaN(currentVal) && currentVal > 0) {
        parent.find('input[name=' + fieldName + ']').val(currentVal - 1);
    } else {
        parent.find('input[name=' + fieldName + ']').val(0);
    }
}

$('.input-group').on('click', '.button-plus', function(e) {
    incrementValue(e);
    var qty = $(this).siblings('.quantity-field').val();
    var parent = $(this).parent();
    let pid = parent.siblings('.pid').text().toString();
    if(!isItemExist(pid)) {
        let pname = parent.siblings('.pname').text().toString();
        let price = parent.siblings('.price').text().toString();
        let pimg = parent.parent().siblings('.pimg').attr('src');
        
        addToCart(pid, pname, pimg, price, qty);
    }else {
        updateQty(pid, qty);
    }
});

$('.input-group').on('click', '.button-minus', function(e) {
    decrementValue(e);
    var qty = $(this).siblings('.quantity-field').val();
    var parent = $(this).parent();
    let pid = parent.siblings('.pid').text().toString();
    if(qty == 0) {
        deleteFromCart(pid);
    }else {
        updateQty(pid, qty);
    }
});

$('.btnRemoveCart').click(function(e) {
    e.preventDefault();
    $(this).parent().parent().remove();
    
})

$('.btnPlaceOrder').click(function(e) {
    e.preventDefault();
    var input1 = $(".product_ID");
    var input2 = $('.qty');
    let data = [];
    for(var i = 0; i < input1.length; i++){
        // alert("hello")
        data.push({
            product_ID: $(input1[i]).val(),
            quantity: $(input2[i]).text()
        }) 
    }

    $.ajax({
        url: '/client/create-order',
        method: 'POST',
        data: { data },
        success: function(result) {
            if(!result.success) {
                alert(result.message);
            }else {
                $('.alert-success').text("Order món ăn thành công");
                $('.alert-success').fadeIn().fadeOut(3000);
                $('#cartBody').empty()
                $('.quantity-field').val(0);
                ajaxOrders(result.bill_ID);
                
            }
            console.log(result)
        },
        error: function(err) {
            console.log(err)
        }
    })

})



function formatDate(date) {
    let time = date.split('T');
    return time[1].split('\.')[0];
}  

function isItemExist(pid) {
    if ($(`tr#${pid}`).length > 0)
        return true;
    return false;
}


function addToCart(pid, pname, pimg, price, qty) {
    var body = $('#cartBody');
    let total = formatCurrency(toNumber(price) * qty);
    
    body.append(
        `<tr id="${pid}">
        
        <td>${pname}</td>
        <td class='dongia'>${price}</td>
        <td class="qty">1</td>
        <td class='tongtien'>${total}</td>
        <input class="product_ID" name="product_ID" type="hidden" value="${pid}">
        <input class="quantity" name="quantity" type="hidden" value="${qty}">
      </tr>`
      
    )
}

function updateQty(pid, qty) {
    let pidBox = $('#cartBody').children(`#${pid}`);
    let total = formatCurrency(toNumber(pidBox.children('.dongia').text()) * qty)
   pidBox.children('.qty').text(qty)
   pidBox.children('.tongtien').text(total)
}

function deleteFromCart(pid) {
	var body = $('#cartBody');
    body.children(`#${pid}`).remove();
}

$(document).ready(function() {
    
    $('.alert-success').hide();
    var priceBox = $('.price');
    
    for(let i = 0; i < priceBox.length; i++) {
        let price = toNumber($(priceBox[i]).text());
        if (price == 0) {    
            $(priceBox[i]).hide();
        }
    }

    let bill_ID = $('#bill_ID').text() || '';
    
    ajaxOrders(bill_ID);

    setInterval(function() {
        ajaxOrders(bill_ID);
    }, 5000)
})

function ajaxOrders(bill_ID) {
    $.ajax({
        url: `/client/get-orders-by-bill/${bill_ID}`,
        method: 'GET',
        success: function(res) {
            const orders = res.orders;
            const total = res.total;
            $('.total-price').text(formatCurrency(total));
            var body = $('#orderBody');
            body.empty();
            orders.forEach(o => {
                let time = formatDate(o.created_at);
                let color = '';
                let status = ''
                switch (o.status) {
                    case 'cancel':
                        color = 'crimson';
                        status = 'Đã hủy'
                        break;
                    case 'waiting':
                        color = '#FE6244';
                        status = 'Đang gọi'
                        break;
                    case 'preparing':
                        color = '#F7DB6A';
                        status = 'Đang chế biến'
                        break;
                    case 'success':
                        color = '#64E291';
                        status = 'Đã xong'
                        break;
                    default:
                        break;
                }

                body.append(
                    `<tr id="${o.pid}_">
                    
                    <td>${o.pname}</td>
                    <td>${o.quantity}</td>
                    <td>${time}</td>
                    <td><i style="color: ${color}" class="fas fa-solid fa-dot-circle"></i> ${status}</td>
                    
                  </tr>`
                  
                )
            })
        },
        error: function(err) {
            // console.log(err)
        }
    })
    
}

function toNumber(str) {
    return parseInt(str.replace('.',''));
}

function formatCurrency(number) {
    return number.toLocaleString('vi', { style: 'currency', currency: 'VND' });
}