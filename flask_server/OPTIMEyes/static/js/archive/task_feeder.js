
// ImageCompare is the namespace
var ImageCompare = (function (IC) {

    IC.TaskFeeder = IC.TaskFeeder || {};
    IC.TaskFeeder.defaultComment = "<insert comment>";

    IC.TaskFeeder.imageDbName = "ret_images/";
    IC.TaskFeeder.resultsDbName = "image_compare_results/";

    // some of this is probably not needed
    IC.TaskFeeder.current_task = "";
    IC.TaskFeeder.current_task_idx = -1;
    IC.TaskFeeder.current_icl = ""; // image_compare_list

    IC.TaskFeeder.SetPrompt = function(prompt) {
        $("#to-do-message").text(prompt);
    }

    // Get base64 representation of image we are fetching from db
    IC.TaskFeeder.getBase64DataOfImageFromCouch = (image_id=1, htmlID="image0")=>{
        var url1 = `http://${DNS}:${HTTP_PORT}/get_image/${image_id}`
        fetch(url1)
        .then(response => {
            return response.text();
        })
        .then(data => {
            $(`#${htmlID}`).attr("src", 'data:image/png;base64,' + data)
            // $("#image-from-flask").attr("src", 'data:image/png;base64,' + data)
            
            // vanilla js
            // document.getElementById('image-from-flask').src = 'data:image/png;base64,' + data;
            
        })
    };

    // Set GetImageDbUrl - BB
    IC.TaskFeeder.GetImageDbUrl = function () {
        var  db_config_elem = document.getElementById("database");
        IC.TaskFeeder.db_config = db_config_elem.options[db_config_elem.selectedIndex].value;

        var  db_config_elem = document.getElementById("database");
        IC.TaskFeeder.db_config = db_config_elem.options[db_config_elem.selectedIndex].value;
        IC.TaskFeeder.hostname = IC.TaskFeeder.db_config = "http://"+DNS+":"+DB_PORT+"/"
        IC.TaskFeeder.imageDbName = IMAGES_DB+"/";
        return IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName;



        //IC.TaskFeeder.hostname = IC.TaskFeeder.db_config = "http://ec2-18-220-36-255.us-east-2.compute.amazonaws.com:54956/";
        // if(typeof DNS === 'undefined'){
        //   setTimeout(window.location.reload, 1000)
        // }else{
        //   IC.TaskFeeder.hostname = IC.TaskFeeder.db_config = "http://"+DNS+":"+DB_PORT+"/"
        //   IC.TaskFeeder.imageDbName = IMAGES_DB+"/";
        //   return IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName;
        // }
    };

    // consult results and image database to select two images to present to user
    IC.TaskFeeder.SetImagePair = function(username) {
        $("#compare-comment").val(this.defaultComment);

        // update the dbconfig - guess this should be a function
        var dbName = IC.TaskFeeder.GetImageDbUrl();
        // COUCHDB AJAX
        // var fullurl = dbName + '_design/basic_views/_view/incomplete_compare_tasks?key=\"' + username+ "\"";
        // FLASK AJAX
        let fullurl=`http://${DNS}:${HTTP_PORT}/get_tasks/compare?username=${username}`
        $.ajax({
            url : fullurl,
            // beforeSend: function (xhr) {
            //         xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
            // },
            type : 'GET',
            success : function(json) {
                // debugger
                var result = json
                var curUser = username;

                // of all pending tasks, are any assigned to this user?
                var newResRows = result.rows.filter(function(obj) {
                    return obj.value.user === username;
                });

                if (newResRows.length < 1)
                    return; // hmmm - some sort of message that there are no pending tasks?



                // BB - start

                var ICL_task_index = 0;
                var task_order = Number.POSITIVE_INFINITY;
                for (var row = 0 ; row < newResRows.length; ++row) {
                    if (newResRows[row].value.task_order < task_order){
                        task_order = newResRows[row].value.task_order;
                        ICL_task_index = row;
                    }

                }

                // set the TaskFeeder ICL info
                var task = IC.TaskFeeder.current_task = newResRows[ICL_task_index].value;
                // var task = IC.TaskFeeder.current_task = newResRows[0].value; // original

                // BB - end



                var curICL = IC.TaskFeeder.current_icl = task.image_compare_list;
                var curTaskIdx = IC.TaskFeeder.current_task_idx = task.current_idx;

                // COUCHDB AJAX
                // let url = dbName + '_design/basic_views/_view/image_compare_lists'
                // FLASK AJAX
                let url = `http://${DNS}:${HTTP_PORT}/get_image_compare_lists`
                // debugger
                // now get the next pair of image ids
                $.ajax({
                    url : url,
                    // beforeSend: function (xhr) {
                    //     xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
                    // },
                    type : 'GET',
                    success: function (json) {
                        // debugger
                        // okay, this seems wrong, we got all the tasks - way too much data over the wire
                        // filtering should happen on the server side - is this what reduce is for?

                        var nextpair;
                        var result = json;
                        var found = false;
                        var prompt = null;

                        for (var ires = 0 ; ires < result.rows.length && !found; ++ires) {

                            var res = result.rows[ires];
                            if (res.id === curICL) {
                                found = true;
                                prompt = res.value.prompt;
                                nextpair = res.value.list[curTaskIdx];

                                if (!nextpair)
                                    debugger;
                            }
                        }
                        if (!found) {
                            alert("No pending tasks");
                            return;
                        }

                        if (prompt) {
                            ImageCompare.TaskFeeder.SetPrompt(prompt);
                        }                      
                        // //img0
                        var idx0 = nextpair[0];
                        image0_src_attribute = IC.TaskFeeder.getBase64DataOfImageFromCouch(idx0.toString(), htmlID="image0")
                        // //img1
                        var idx1 = nextpair[1];
                        image1_src_attribute = IC.TaskFeeder.getBase64DataOfImageFromCouch(idx1.toString(), htmlID="image1")

                        // ---###
                        // var idx0 = nextpair[0];
                        // var img0 = document.getElementById("image0");
                        //img0.src = IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + idx0.toString() + "/image";
                        // $("#image0").fadeOut(100, function() {
                        //     var newSrc = IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + idx0.toString() + "/image";
                        //     var newImg = new Image(); // by having a new image, onload is called even if the image is already cached
                        //     newImg.onload = function() {
                        //         $("#image0").attr("src", newImg.src);
                        //         $("#image0").fadeIn(100);
                        //     };
                        //     newImg.src = newSrc;//.fadeIn(400);
                        // });

                        // var idx1 = nextpair[1];
                        // var img1 = document.getElementById("image1");
                        //img1.src = IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + idx1.toString() + "/image";
                        // $("#image1").fadeOut(100, function () {
                        //     var newSrc = IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + idx1.toString() + "/image";
                        //     var newImg = new Image(); // by having a new image, onload is called even if the image is already cached
                        //     newImg.onload = function() {
                        //         $("#image1").attr("src", newImg.src);
                        //         $("#image1").fadeIn(100);
                        //     };
                        //     newImg.src = newSrc;//.fadeIn(400);
                        // });
                        // ---###

                        IC.TaskFeeder.Image0 = idx0;
                        IC.TaskFeeder.Image1 = idx1;

                    },
                    error: function (response) {
                        console.log("get of tasks failed : " + JSON.stringify(response));
                    }
                });

            },
            error: function (response) {
                console.log("get failed : " + JSON.stringify(response));
            }
        });


    };

    // consult results and image database to select two images to present to user
    IC.TaskFeeder.SetOCTImagePair = function(username) {

        $("#compare-comment").val(this.defaultComment);

        // update the dbconfig - guess this should be a function
        var dbName = IC.TaskFeeder.GetImageDbUrl();
        debugger; // BB - wasn't sure we'd see this part of the code. Exciting times...
        var fullurl = dbName + '_design/basic_views/_view/incomplete_OCTcompare_tasks?key=\"' + username+ "\"";
        $.ajax({
            url : fullurl,
            // beforeSend: function (xhr) {
            //     xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
            // },
            type : 'GET',
            success : function(json) {

                var result = json
                var curUser = username;

                // of all pending tasks, are any assigned to this user?
                var newResRows = result.rows.filter(function(obj) {
                    return obj.value.user === username;
                });

                if (newResRows.length < 1)
                    return; // hmmm - some sort of message that there are no pending tasks?

                // set the TaskFeeder ICL info
                var task = IC.TaskFeeder.current_task = newResRows[0].value;
                var curICL = IC.TaskFeeder.current_icl = task.OCTimage_compare_list;
                var curTaskIdx = IC.TaskFeeder.current_task_idx = task.current_idx;

                // now get the next pair of image ids
                debugger; // BB - wasn't sure we'd see this part of the code. Exciting times...
                $.ajax({
                    url : dbName + '_design/basic_views/_view/OCTimage_compare_lists',
                    type : 'GET',
         	        beforeSend: function (xhr) {
	  	                xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
	   	            },
                    success: function (json) {
                        // okay, this seems wrong, we got all the tasks - way too much data over the wire
                        // filtering should happen on the server side - is this what reduce is for?

                        var nextpair;
                        var result = json;
                        var found = false;
                        var prompt = null;

                        for (var ires = 0 ; ires < result.rows.length && !found; ++ires) {

                            var res = result.rows[ires];
                            if (res.id === curICL) {
                                found = true;
                                prompt = res.value.prompt;
                                nextpair = res.value.list[curTaskIdx];

                                if (!nextpair)
                                    debugger;
                            }
                        }

                        if (!found) {
                            alert("No pending tasks");
                            return;
                        }

                        if (prompt) {
                            ImageCompare.TaskFeeder.SetPrompt(prompt);
                        }

                        var idx0 = nextpair[0];
                        var idx1 = nextpair[1];

                        IC.TaskFeeder.Image0 = idx0;
                        IC.TaskFeeder.Image1 = idx1;
                        IC.TaskFeeder.Image0Idx = 0;
                        IC.TaskFeeder.Image1Idx = 0;
                        debugger; // BB - wasn't sure we'd see this part of the code. Exciting times...
                        $.ajax({
                            url : IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + "OCT" + idx0.toString(),
                            beforeSend: function (xhr) {
		    	                xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
		    	            },
                            type : 'GET',
                            success : function(json) {
                                IC.TaskFeeder.Image0Max = json.numImages;
                                IC.TaskFeeder.Image0Idx = Math.floor(IC.TaskFeeder.Image0Max/2);
                                $('#slider0').attr("max", json.numImages-1);
                                $('#slider0').val(IC.TaskFeeder.Image0Idx);

                                var img0 = document.getElementById("image0");
                                $("#image0").fadeOut(100, function() {
                                    var newSrc = IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + "OCT" + idx0.toString() + "/image" + IC.TaskFeeder.Image0Idx.toString();
                                    var newImg = new Image(); // by having a new image, onload is called even if the image is already cached
                                    newImg.onload = function() {
                                        $("#image0").attr("src", newImg.src);
                                        $("#image0").fadeIn(100);
                                    };
                                    newImg.src = newSrc;//.fadeIn(400);
                                });
                            }
                        });
                        debugger; // BB - wasn't sure we'd see this part of the code. Exciting times...
                        $.ajax({
                            url : IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + "OCT" + idx1.toString(),
			                beforeSend: function (xhr) {
		    	                xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
		    	            },
                            type : 'GET',
                            success : function(json) {
                                IC.TaskFeeder.Image1Max = json.numImages;
                                IC.TaskFeeder.Image1Idx = Math.floor(IC.TaskFeeder.Image1Max/2);
                                $('#slider1').attr("max", json.numImages-1);
                                $('#slider1').val("value", IC.TaskFeeder.Image1Idx);

                                var img1 = document.getElementById("image1");
                                $("#image1").fadeOut(100, function() {

                                    var newSrc = IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + "OCT" + idx1.toString() + "/image" + IC.TaskFeeder.Image1Idx.toString();
                                    var newImg = new Image(); // by having a new image, onload is called even if the image is already cached
                                    newImg.onload = function() {
                                        $("#image1").attr("src", newImg.src);
                                        $("#image1").fadeIn(100);
                                    };
                                    newImg.src = newSrc;//.fadeIn(400);
                                });
                            }
                        });


                        // $("#slider0").slider("destroy");
                        // $("#slider1").slider("destroy");
                        //
                        // $("#slider0").slider({
                        //     min: 0, // min value
                        //     max: IC.TaskFeeder.Image0Max,
                        //     value: Math.floor(IC.TaskFeeder.Image0Max/2),
                        //     slide: function(event, ui) {
                        //       SliderChange(ui.value, ui.id)
                        //     }
                        // });​
                        //
                        // $("#slider1").slider({
                        //     min: 0, // min value
                        //     max: IC.TaskFeeder.Image1Max,
                        //     value: Math.floor(IC.TaskFeeder.Image1Max/2),
                        //     slide: function(event, ui) {
                        //       SliderChange(ui.value, ui.id)
                        //     }
                        // });​
                    },
                    error: function (response) {
                        console.log("get of tasks failed : " + JSON.stringify(response));
                    }
                });

            },
            error: function (response) {
                console.log("get failed : " + JSON.stringify(response));
            }
        });


    };

    IC.TaskFeeder.SwitchOCTImage = function(index, imageNum) {
        if(imageNum === 0) { //change image 0
            IC.TaskFeeder.Image0Idx = index;
            var newSrc = IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + "OCT" + IC.TaskFeeder.Image0.toString() + "/image" + IC.TaskFeeder.Image0Idx;
            var newImg = new Image(); // by having a new image, onload is called even if the image is already cached
            newImg.onload = function() {
                $("#image0").attr("src", newImg.src);
            };
            newImg.src = newSrc;//.fadeIn(400);
        } else if(imageNum === 1) { //change image 0
            IC.TaskFeeder.Image1Idx = index;
            var newSrc = IC.TaskFeeder.hostname + IC.TaskFeeder.imageDbName + "OCT" + IC.TaskFeeder.Image1.toString() + "/image" + IC.TaskFeeder.Image1Idx;
            var newImg = new Image(); // by having a new image, onload is called even if the image is already cached
            newImg.onload = function() {
                $("#image1").attr("src", newImg.src);
            };
            newImg.src = newSrc;//.fadeIn(400);
        }
    }

    return IC;

}(ImageCompare || {}));
