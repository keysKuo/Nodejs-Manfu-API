

function switchStatus(order_ID, status) {
    
    ajaxSwitchOrderStatus(order_ID, status);
}

function ajaxSwitchOrderStatus(order_ID, status) {
    $.ajax({
        url: `/kitchen/switch-status-order/${order_ID}/${status}`,
        method: 'GET',
        success: function(result) {
            
            ajaxReloadOrders();
        },
        error: function(err) {
            alert(err);
        }
    })
}

function ajaxReloadOrders() {
    $.ajax({
        url: '/kitchen/queue?key=reload',
        method: 'GET',
        success: function(result) {
            console.log(result);
            const waits = result.orders_wait;
            const prepares = result.orders_prepare;

            $('.form-wait').empty();
            $('.form-prepare').empty();
            for(let i = 0; i < waits.length; i++) {
                $('.form-wait').append(
                    `
                    <li class="form__item">
                        <div class="img-box inline__block">
                                <img style="width: 100%" src="/images/Logo/manfu-test.png" alt="">
                                <p style="visibility: hidden;">...</p>
                            </div>
                            <div class="info-box inline__block">
                                
                                <p><b>Món: </b>${waits[i].pname}</p>
                                <p><b>Bàn: </b>${waits[i].table}</p>
                                <p><b>Order lúc: </b>${waits[i].created_at}</p>
                                <p style="visibility: hidden;">...</p>
        
                            </div>
                            <div class="check-box inline__block">
                                ${waits[i].nextStatus}
                                <a onclick="switchStatus('${waits[i].order_ID}','cancel')" data-id="${waits[i].order_ID}" style="font-size: 10px" class="btn btn-danger sw-cancel w-100 ">Hủy</a>
                                <p style="visibility: hidden;">...</p>
                            </div>
                    
                    </li>
                    `
                )
            }
            
            for(let i = 0; i < prepares.length; i++) {
                $('.form-prepare').append(
                    `
                    <li class="form__item">
                        <div class="img-box inline__block">
                                <img style="width: 100%" src="/images/Logo/manfu-test.png" alt="">
                                <p style="visibility: hidden;">...</p>
                            </div>
                            <div class="info-box inline__block">
                                
                                <p><b>Món: </b>${prepares[i].pname}</p>
                                <p><b>Bàn: </b>${prepares[i].table}</p>
                                <p><b>Order lúc: </b>${prepares[i].created_at}</p>
                                <p style="visibility: hidden;">...</p>
        
                            </div>
                            <div class="check-box inline__block">
                                ${prepares[i].nextStatus}
                                <a onclick="switchStatus('${prepares[i].order_ID}','cancel')" data-id="${prepares[i].order_ID}" style="font-size: 10px" class="btn btn-danger sw-cancel w-100 ">Hủy</a>
                                <p style="visibility: hidden;">...</p>
                            </div>
                    
                    </li>
                    `
                )
            }
            
        },
        error: function(err) {
            alert(err);
        }
    })
}