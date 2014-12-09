/// <reference path="statusPage.js" />

/**
 * IM RJ TW
 */

var google_map; //google.maps.Map
var lat_in = 45.3469;
var lng_in = -75.7598;
var city_code = "oc";
var mode = "dynamic";
var zoom_level = 17;
var wait_widow = "wait_window"

//Algonquin
//45.3488346
//-75.7556763



var IS_QUIK = false;
var IS_DEBUG = false;

$(document).ready(function ()
{
    $.support.cors = true;

    alert("Set Breakpoints Now");

    $(document).bind('deviceready', function ()
    {
        //Status page initialization
        statusPage.init("status_page", "status_list", "refresh_btn", "map_btn");
        busListPage.init("bus_list");

        //Restart
        document.getElementById("cancel_wait").addEventListener('click', function ()
        {
            controller.startGeoLocation(IS_DEBUG);
        }, false);

        if (IS_QUIK)
        {
            controller = new SurrealRanch_Controller.Controller(lat_in, lng_in, city_code, mode, zoom_level, wait_widow);
            controller.document_width = $(document).width();
            controller.document_height = $(document).height();
            controller.quickInit('map_canvas', 'wait_window');

            var url = "http://geopad.ca/js/get_json_for.php?trips=3017b77_560b94_468b95_112";
            statusPage.makeList(url);
            google.maps.event.addListener(statusPage, 'make_status_done', function (status) {
                controller.hideWaitWindow();
                if (status == "SUCCESS") {
                    //alert(status);
                    controller.hideMap();
                    statusPage.showPage();
                }
                else {
                    alert(status);
                }
            });
        }
        else
        {
            controller = new SurrealRanch_Controller.Controller(lat_in, lng_in, city_code, mode, zoom_level, wait_widow);
            controller.startGeoLocation(IS_DEBUG);
            controller.document_width = $(document).width();
            controller.document_height = $(document).height();

            google.maps.event.addListener(controller.peg_marker, 'geolocation_error', function (errMsg) {
                document.getElementById("wait_msg").innerHTML = errMsg;
                document.getElementById("refresh_btn").className = "show";
            });

            google.maps.event.addListener(controller.peg_marker, 'geolocation_done', function(result)
            {
                google_map = controller.initialize(result, 'map_canvas', 'wait_window');

                status_form = new SurealRanch_Controls.Form(google_map,"shadow", google.maps.ControlPosition.TOP_CENTER, controller.document_height, controller.document_width);

                var status = '<span class="status">Lat: ' + this.lat + ' Long: ' + this.lng + '</span>'
                status_form.setStatus(status);

                google.maps.event.addListener(controller, 'draw_routes_done', function(obj)
                {
                    this.stop_list.CloseCurrentInfoWindow();
                    controller.hideWaitWindow();
                    if(controller.text_mode)
                    {
                        var str = '<textarea style="height:600px; width:200px" >' + obj + '</textarea>';
                        status_form.setContent(str);
                    }
                    else
                    {
                        var str = "";
                        for(var i = 0; i < controller.bus_list.buses.length; i++)
                        {
                            str += controller.bus_list.buses[i].Status();
                        }
                        status_form.setContent(str);
                    }
                });
		
                google.maps.event.addListener(controller, 'draw_routes_error', function(errMsg)
                {
                    controller.hideWaitWindow();
                    alert(errMsg);
                });
		
                google.maps.event.addListener(status_form, 'TabOne_clicked', function(obj)
                {
                    switch(obj.id)
                    {
                        case 'TabOne':
                            controller.text_mode = !controller.text_mode;
                            if(controller.text_mode)
                            {
                                status_form.tab1.innerHTML = "<b>Text Mode</b>";
                            }
                            else
                            {
                                status_form.tab1.innerHTML = "<b>Object Mode</b>";
                            }
                            break;
                        default:
                            alert("The button: " + obj.id + " was clicked");
                            break;
                    }
                });

                google.maps.event.addListener(statusPage, 'make_status_done', function (status) {
                    controller.hideWaitWindow();
                    if (status == "SUCCESS") {
                        //alert(status);
                        controller.hideMap();
                        statusPage.showPage();
                        document.getElementById("bus_list").className = "hide";
                    }
                    else {
                        alert(status);
                    }
                });
            });
        }
    });
});

