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
            console.log(result)
        },
        error: function(err) {
            
        }
    })

})

function isItemExist(pid) {
    if ($(`tr#${pid}`).length > 0)
        return true;
    return false;
}


function addToCart(pid, pname, pimg, price, qty) {
    var body = $('#cartBody');
    
    body.append(
        `<tr id="${pid}">
        <td class="w-25">
          <img src="${pimg}" class="img-fluid img-thumbnail" alt="Sheep">
        </td>
        <td>${pname}</td>
        <td>${price}</td>
        <td class="qty">1</td>
        <td><input class="product_ID" name="product_ID" type="hidden" value="${pid}">
        <input class="quantity" name="quantity" type="hidden" value="${qty}">0đ</td>
        
      </tr>`
      
    )
}

function updateQty(pid, qty) {
    $('#cartBody').children(`#${pid}`).children('.qty').text(qty)
}

function deleteFromCart(pid) {
	var body = $('#cartBody');
    body.children(`#${pid}`).remove();
}

