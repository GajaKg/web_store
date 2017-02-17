

$(document).ready(function(){

$("#datepicker1").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '1990:2020',
        dateFormat : 'yy-mm-dd',
        defaultDate: new Date(1996, 06, 01)
});

$("#datepicker2").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '1990:2020',
        dateFormat : 'yy-mm-dd',
        defaultDate: new Date(1996, 06, 01)
});
    
$("#orderWord").attr("disabled", false);
    
});



// ********************** SEARCH ORDERS ***************** \\

function searchOrderByWord(word, searchPlace){
    var ordersByWord = []; 
    //console.log(searchPlace);
    for(var o in searchPlace){
        if(searchPlace[o].CustomerID.toLowerCase().indexOf(word) > -1 || searchPlace[o].CustomerID.indexOf(word) > -1){
                ordersByWord.push(searchPlace[o]);
        } 
    }
    return ordersByWord;
}

function searchOrderByDate(date1, date2, searchPlace){
    var dateOrders = [];
    
    if(date1 == "" && date2 == ""){
        for(var o in searchPlace){
            dateOrders.push(searchPlace[o]);
        }
    }

    if(date1 != "" && date2 == ""){
        for(var o in searchPlace){
            searchPlace[o].OrderDate = formatDate(searchPlace[o].OrderDate);
            if(searchPlace[o].OrderDate >= date1){
                dateOrders.push(searchPlace[o]);
            }
        }
    }

    if(date1 != "" && date2 != ""){
        for(var o in searchPlace){
            searchPlace[o].OrderDate = formatDate(searchPlace[o].OrderDate);
            if(searchPlace[o].OrderDate >= date1 && searchPlace[o].OrderDate <= date2){
                dateOrders.push(searchPlace[o]);
            }
        }
    }
    
    if(date1 == "" && date2 != ""){
        for(var o in searchPlace){
            searchPlace[o].OrderDate = formatDate(searchPlace[o].OrderDate);
            if(searchPlace[o].OrderDate <= date2){
                dateOrders.push(searchPlace[o]);
            }
        }
    }
    
    return dateOrders;
   
}

function ordersSearch(){
    
    $("section").html("");
    var word = $("#orderWord").val();
    var selectedDate1 = $("#datepicker1")[0].value; 
    var selectedDate2 = $("#datepicker2")[0].value; 
    
    if(!inMyOrders){
    
        if(word == ""){

            var ordersByDate = searchOrderByDate(selectedDate1, selectedDate2, orders);

            myOrdersTableHeader();
            var expensive = mostExpensiveOrder(ordersByDate);

            for(var o in ordersByDate){
                myOrdersTable(ordersByDate[o], expensive);
            }

        } // if(word == ""){


        if(word != ""){
        var ordersByWord = searchOrderByWord(word, orders); 
        var ordersByDate = searchOrderByDate(selectedDate1, selectedDate2, ordersByWord);
        
        myOrdersTableHeader();
        var expensive = mostExpensiveOrder(ordersByDate);
        
        for(var o in ordersByDate){
            myOrdersTable(ordersByDate[o], expensive);
        }
            
    }// if(word != ""){
        
    } // if(!inMyOrders)
    
    if(inMyOrders){

    
        if(word == ""){

            var ordersByDate = searchOrderByDate(selectedDate1, selectedDate2, customerOrders);

            myOrdersTableHeader();
            var expensive = mostExpensiveOrder(ordersByDate);

            for(var o in ordersByDate){
                myOrdersTable(ordersByDate[o], expensive);
            }

        } // if(word == ""){


        if(word != ""){
            var ordersByWord = searchOrderByWord(word, customerOrders); 
            var ordersByDate = searchOrderByDate(selectedDate1, selectedDate2, ordersByWord);

            myOrdersTableHeader();
            var expensive = mostExpensiveOrder(ordersByDate);

            for(var o in ordersByDate){
                myOrdersTable(ordersByDate[o], expensive);
            }

        } 
        
    } // if(inMyOrders){
}







//************* DOM ORDERS ********* \\
function myOrdersTableHeader(){
    $("section").append("<div id='myO'>");
    $("#myO").append("<table class='table' class='display'>");
    $(".table").append("<thead><tr>"+
                             "<th>Customer</th>"+
                             "<th>Order price</th>"+
                             "<th>Ship city</th>"+
                             "<th>Ship Country</th>"+
                             "<th>Order Date</th>"+
                        "</tr></thead>");     
}

function myOrdersTable(order, expensive){

    //var expensive = mostExpensiveOrder(customerOrders);
    if(order.OrderPrice == expensive){
        $(".table").append("<tr style='background-color: #C9F0B1;'>"+
                                 "<th>"+order.CustomerID+"</th>"+
                                 "<th>"+order.OrderPrice+" $</th>"+
                                 "<th>"+order.ShipCity+"</th>"+
                                 "<th>"+order.ShipCountry+"</th>"+
                                 "<th>"+order.OrderDate+"</th>"+
                            "</tr>");        
    } else {
    
        $(".table").append("<tr>"+
                             "<th>"+order.CustomerID+"</th>"+
                             "<th>"+order.OrderPrice+" $</th>"+
                             "<th>"+order.ShipCity+"</th>"+
                             "<th>"+order.ShipCountry+"</th>"+
                             "<th>"+order.OrderDate+"</th>"+
                        "</tr>");      
    }

}




/********** MY ORDERS **********/
var inMyOrders = false;
function myOrders(){
    inMyOrders = true; 
    disableProductSearch();
    enableOrdersSearch();
     
    $("section").html("");

    myOrdersTableHeader();
    
    var expensive = mostExpensiveOrder(customerOrders);
    for(var o in customerOrders){
        
        customerOrders[o].OrderPrice = findOrderPrice(customerOrders[o].Order_Details);
        customerOrders[o].OrderDate = formatDate(customerOrders[o].OrderDate);
        
        myOrdersTable(customerOrders[o], expensive);      
        
    }
    console.log(customerOrders);
}

/********** ALL ORDERS **********/
var inOrders = false;
function displayAllOrders(){
    $("section").html("");
    inMyOrders = false; 
    disableProductSearch();
    enableOrdersSearch();
    
    myOrdersTableHeader();
    
    var expensive = mostExpensiveOrder(orders);
    for(var o in orders){
        orders[o].OrderPrice = findOrderPrice(orders[o].Order_Details);
        orders[o].OrderDate = formatDate(orders[o].OrderDate);
        
        myOrdersTable(orders[o], expensive);   
        
    }
}





//************ ORDERS PRICE ******************\\\
function mostExpensiveOrder(selectedOrders){
    var ordersPrice = []; 

    for(var o in selectedOrders){
        
        selectedOrders[o].OrderPrice = findOrderPrice(selectedOrders[o].Order_Details);
        ordersPrice.push(selectedOrders[o].OrderPrice); // for finding most expensive order        
        
    }
    return biggestNumber(ordersPrice);
}

function biggestNumber(brojevi) {

    max = brojevi[0];
    
    for (var i = 0; i < brojevi.length; i++) {
        
        if (brojevi[i] > max) {
            
            max = brojevi[i];
            
        }
    }
    return max;
}

function findOrderPrice(order){
    
    var price = 0;
    
    for(var o in order){
        var UnitPrice = parseFloat(order[o].UnitPrice).toFixed(2);
        var Quantity = order[o].Quantity;
        //console.log(typeof UnitPrice + " // " + typeof Quantity);
        price +=  UnitPrice * Quantity; 

    }
    
    //return Math.round(price * 10) / 10;
    return price;
}





// ********************* HELPER FUNCTIONS ********************** \\
function enableOrdersSearch(){
    inOrders = true;
    setTimeout(function(){$("#ordersToggle").show("slow")}, 500); 
}

function disableOrdersSearch(){
    inOrders = false;
    setTimeout(function(){$("#ordersToggle").hide("slow")}, 500); 
}

function disableProductSearch(){
    $("#productsToggle input").attr("disabled", true);
    $("#searchCategory").attr("disabled", true);
    $("#searchRange").attr("disabled", true);
}

function enableProductSearch(){
    $("#productsToggle input").attr("disabled", false);
    $("#searchCategory").attr("disabled", false);
    $("#searchRange").attr("disabled", false);
}

function formatDate(date){
    return date.substr(0, 10);
}

/*
function myOrders(){
    var customerOrders = findOrdersByCustomerID();
    //console.log(co); 
    $("section").html("");
    
    myOrdersTable();

    $('#myTable').DataTable({
        data: customerOrders,
        columns: [
            { data: 'OrderID' },
            { data: 'ShipCity' },
            { data: 'ShipCountry' },
            { data: 'OrderDate' }
        ]
    });
}

function myOrdersTable(){
    $("section").append("<div id='myO'>");
    $("#myO").append("<table id='myTable' class='display'>");
    $("#myTable").append("<thead><tr>"+
                             "<th>Order id</th>"+
                             "<th>Ship city</th>"+
                             "<th>Ship Country</th>"+
                             "<th>Order Date</th>"+
                        "</tr></thead>");
}
*/   


