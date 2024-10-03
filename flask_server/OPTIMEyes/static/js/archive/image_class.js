/* Feeder inherits from default.js */

var ClassifyTaskFeeder = {}; // Meant to be global

function init_app() {
    // debugger
    // Update global app feeder variable
    const config_obj = {
        endpoint_image_list: "image_classify_lists",
        message: "Default Classify Message",
        app: "classify"
    }
    ClassifyTaskFeeder = new TaskFeeder(config_obj);
    // Override methods and attributes of interest

    // - Attributes
    ClassifyTaskFeeder.currentImg = null;
    ClassifyTaskFeeder.nextImg = null;
    ClassifyTaskFeeder.usingCheckbox = true;
    ClassifyTaskFeeder.keyboardShortcuts = false; // turn keyboard listener on\off

    // - Methods
    ClassifyTaskFeeder.buildUI = function (imageList) {
        // debugger
        if (imageList === "no tasks left") {
            $("#image0").attr('src', "")
            return "no tasks means no UI to build"
        } else {
            this.currentImg = this.imageList[this.currentTask.current_idx]
            // //img0
            this.getBase64DataOfImageFromCouch(this.currentImg.toString(), htmlID = "image0")
                .then(response => {
                    // enable buttons now that submission is over
                    // debugger
                    document.getElementById("image_name").innerHTML = this.nextImg
                    this.enableButtons();
                })
        }
    };

    ClassifyTaskFeeder.classifySubmit = function (selection) {
        console.log("classifySubmit");
        this.disableButtons();
        // Gather all imageIDs
        TF = this;
        const user = this.user;

        const currentTime = new Date();

        const timeStr = currentTime.toString();
        const img0 = `http://${DNS}:${DB_PORT}/${COUCH_DB}/${this.currentImg}`;
        const task = this.currentTask._id;
        const task_idx = this.currentTask.current_idx;
        // debugger

        save_results = {
            user: user,
            type: "classifyResult",
            date: timeStr,
            image: img0,
            // diagnosis: selection.id, // button id
            task: task,
            task_list_name: this.currentTask.list_name,
            task_idx: task_idx,
        }

        // Check if this is a button or checkbox classification
        if (ClassifyTaskFeeder.usingCheckbox && document.getElementById('class_checkboxes') != null){
            let checkboxes = ['normal','ABV','GSP','HSP','RP', 'other_checkbox', 'nabothian_cyst', 'excessive_reflections', 'inadequate']
            checkboxes.forEach((v,i,a) =>{
                save_results[`diagnosis_${v}`] = document.getElementById(v).checked
            })
        }
        $.ajax({
            url: `http://${DNS}:${HTTP_PORT}/task_results`,
            data: JSON.stringify(save_results),
            dataType: "json",
            type: 'POST',
            contentType: 'application/json',
            success: function (response) {
                // debugger
                // Uncheck checkbox
                TF.clearSelection()
                // Reset incomplete tasks list
                TF.OnSetUser(TF.user)
                
            },
            error: function (response) {
                console.log("get of tasks failed : " + JSON.stringify(response));
            }
        });

    };


    ClassifyTaskFeeder.commentAlert = function () {
        alert('If you want to provide an optional justification for your decision (left/right/tie), please enter it before you click left/right/tie. The text box will refresh after a decision is made.')
    };

    ClassifyTaskFeeder.initCheckboxListener = function (number_keys) {
        normal_checkbox = document.getElementById('normal');
        ABV_checkbox = document.getElementById('ABV');
        GSP_checkbox = document.getElementById('GSP');
        HSP_checkbox = document.getElementById('HSP');
        RP_checkbox = document.getElementById('RP');
        other_checkbox = document.getElementById('other_checkbox');
        nabothian_cyst_checkbox = document.getElementById('nabothian_cyst');
        excessive_reflections_checkbox = document.getElementById('excessive_reflections');
        inadequate_checkbox = document.getElementById('inadequate');
        // If anything but normal is checked, unselect normal
        ABV_checkbox.addEventListener('change', function() {
            normal_checkbox.checked = false;
            inadequate_checkbox.checked = false;
        });
        GSP_checkbox.addEventListener('change', function() {
            normal_checkbox.checked = false;
            inadequate_checkbox.checked = false;
        });
        HSP_checkbox.addEventListener('change', function() {
            normal_checkbox.checked = false;
            inadequate_checkbox.checked = false;
        });
        RP_checkbox.addEventListener('change', function() {
            normal_checkbox.checked = false;
            inadequate_checkbox.checked = false;
        });
        other_checkbox.addEventListener('change', function() {
            normal_checkbox.checked = false;
            inadequate_checkbox.checked = false;
        });
        nabothian_cyst_checkbox.addEventListener('change', function() {
            normal_checkbox.checked = false;
            inadequate_checkbox.checked = false;
        });
        excessive_reflections.addEventListener('change', function() {
            normal_checkbox.checked = false;
            inadequate_checkbox.checked = false;
        });
        // If inadequate is checked unselect everything else
        inadequate_checkbox.addEventListener('change', function() {
            if(inadequate_checkbox.checked === true){
                normal_checkbox.checked = false;
                ABV_checkbox.checked = false;
                GSP_checkbox.checked = false;
                HSP_checkbox.checked = false;
                RP_checkbox.checked = false;
                other_checkbox.checked = false;
                nabothian_cyst_checkbox.checked = false;
                excessive_reflections_checkbox.checked = false;
                
            }          
        });
        // If normal is checked unselect everything else
        normal_checkbox.addEventListener('change', function() {
            if(normal_checkbox.checked === true){
                ABV_checkbox.checked = false;
                GSP_checkbox.checked = false;
                HSP_checkbox.checked = false;
                RP_checkbox.checked = false;
                other_checkbox.checked = false;
                nabothian_cyst.checked = false;
                excessive_reflections_checkbox.checked = false;
                inadequate_checkbox.checked = false;
            }          
        });
    };
    
    ClassifyTaskFeeder.initKeyboardListener = function () {
        TF = this;
        document.addEventListener('keydown', function (event) {
            if (!($("#rejectModal").css("display") === "block")) {
                if (TF.keyboardShortcuts === false) {
                    if (event.keyCode == 13) {
                        alert('Enter was pressed');
                    }
                    else if (event.keyCode == 37) {
                        alert('Left Arrow was pressed');
                    }                    
                    else if (event.keyCode == 48) {
                        alert('0 was pressed');
                    }
                    else if (event.keyCode == 49) {
                        alert('1 was pressed');
                    }
                    else if (event.keyCode == 50) {
                        alert('2 was pressed');
                    }
                    else if (event.keyCode == 51) {
                        alert('3 was pressed');
                    }
                    else if (event.keyCode == 52) {
                        alert('4 was pressed');
                    }
                    else if (event.keyCode == 53) {
                        alert('5 was pressed');
                    }
                    else if (event.keyCode == 54) {
                        alert('6 was pressed');
                    }
                    else if (event.keyCode == 55) {
                        alert('7 was pressed');
                    }
                    else if (event.keyCode == 56) {
                        alert('8 was pressed');
                    }
                } else if (TF.keyboardShortcuts === true && document.getElementById("normal").disabled === false) {
                    if (event.keyCode == 13) {
                        $("#submit_button")[0].click()
                    
                    }else if (event.keyCode == 37) {
                        $("#previousClassification")[0].click()
                    }
                    else if (event.keyCode == 48) {
                        $("#normal")[0].click()
                    }
                    else if (event.keyCode == 49) {
                        $("#ABV")[0].click()
                    }
                    else if (event.keyCode == 50) {
                        $("#GSP")[0].click()
                    }
                    else if (event.keyCode == 51) {
                        $("#HSP")[0].click()
                    }
                    else if (event.keyCode == 52) {
                        $("#RP")[0].click()
                    }
                    else if (event.keyCode == 53) {
                        $("#other_checkbox")[0].click()
                    }
                    else if (event.keyCode == 54) {
                        $("#nabothian_cyst")[0].click()
                    }
                    else if (event.keyCode == 55) {
                        $("#excessive_reflections")[0].click()
                    }
                    else if (event.keyCode == 56) {
                        $("#inadequate")[0].click()
                    }

                }
            }
        });  
    };

    ClassifyTaskFeeder.toggleKeyboardShortcuts = function () {
        p_mode = document.getElementById('keyboardShortcuts')
        if (this.keyboardShortcuts === true) {
            p_mode.innerHTML = 'Off'
            this.keyboardShortcuts = false
            console.log(p_mode.innerHTML)
            console.log(this.keyboardShortcuts)
        } else {
            p_mode.innerHTML = 'On'
            this.keyboardShortcuts = true
            console.log(p_mode.innerHTML)
            console.log(this.keyboardShortcuts)
        }
    };

    ClassifyTaskFeeder.resetToPreviousClassification = function () {
        TF = this;
        if (TF.currentTask.current_idx === 0) {
            alert('You are on the first task, cannot go back.')
        } else {
            TF.disableButtons();
            $.ajax({
                url: this.url_reset_to_previous_result,
                type: 'POST',
                data: JSON.stringify(this.currentTask),
                headers: { 'Content-Type': 'application/json' },
                success: (response) => {
                    TF.OnSetUser(TF.user)
                },
                error: (response) => {
                    console.log('resetToPreviousClassification error!')
                },
            });
        }
    };

    ClassifyTaskFeeder.clearSelection = function () {
        document.getElementById("normal").checked = false;
        document.getElementById("ABV").checked = false;
        document.getElementById("GSP").checked = false;
        document.getElementById("HSP").checked = false;
        document.getElementById("RP").checked = false;
        document.getElementById("other_checkbox").checked = false;
        document.getElementById("nabothian_cyst").checked = false;
        document.getElementById("excessive_reflections").checked = false;
        document.getElementById("inadequate").checked = false;
    };

    ClassifyTaskFeeder.enableButtons = function () {
        document.getElementById("normal").disabled = false;
        document.getElementById("ABV").disabled = false;
        document.getElementById("GSP").disabled = false;
        document.getElementById("HSP").disabled = false;
        document.getElementById("RP").disabled = false;
        document.getElementById("other_checkbox").disabled = false;
        document.getElementById("nabothian_cyst").disabled = false;
        document.getElementById("excessive_reflections").disabled = false;
        document.getElementById("inadequate").disabled = false;
        document.getElementById("previousClassification").disabled = false;
    };

    ClassifyTaskFeeder.disableButtons = function () {
        document.getElementById("normal").disabled = true;
        document.getElementById("ABV").disabled = true;
        document.getElementById("GSP").disabled = true;
        document.getElementById("HSP").disabled = true;
        document.getElementById("RP").disabled = true;
        document.getElementById("other_checkbox").disabled = true;
        document.getElementById("nabothian_cyst").disabled = true;
        document.getElementById("excessive_reflections").disabled = true;
        document.getElementById("inadequate").disabled = true;
        document.getElementById("previousClassification").disabled = true;
    };

    ClassifyTaskFeeder.magnify = function (imgID, zoom) {
        var img, glass, w, h, bw;
        img = document.getElementById(imgID);
      
        /* Create magnifier glass: */
        glass = document.createElement("DIV");
        glass.setAttribute("class", "img-magnifier-glass");
      
        /* Insert magnifier glass: */
        img.parentElement.insertBefore(glass, img);
      
        /* Set background properties for the magnifier glass: */
        glass.style.backgroundImage = "url('" + img.src + "')";
        glass.style.backgroundRepeat = "no-repeat";
        glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
        bw = 3;
        w = glass.offsetWidth / 2;
        h = glass.offsetHeight / 2;
      
        /* Execute a function when someone moves the magnifier glass over the image: */
        glass.addEventListener("mousemove", moveMagnifier);
        img.addEventListener("mousemove", moveMagnifier);
      
        /*and also for touch screens:*/
        glass.addEventListener("touchmove", moveMagnifier);
        img.addEventListener("touchmove", moveMagnifier);
        function moveMagnifier(e) {
          var pos, x, y;
          /* Prevent any other actions that may occur when moving over the image */
          e.preventDefault();
          /* Get the cursor's x and y positions: */
          pos = getCursorPos(e);
          x = pos.x;
          y = pos.y;
          /* Prevent the magnifier glass from being positioned outside the image: */
          if (x > img.width - (w / zoom)) {x = img.width - (w / zoom);}
          if (x < w / zoom) {x = w / zoom;}
          if (y > img.height - (h / zoom)) {y = img.height - (h / zoom);}
          if (y < h / zoom) {y = h / zoom;}
          /* Set the position of the magnifier glass: */
          glass.style.left = (x - w) + "px";
          glass.style.top = (y - h) + "px";
          /* Display what the magnifier glass "sees": */
          glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
        }
      
        function getCursorPos(e) {
          var a, x = 0, y = 0;
          e = e || window.event;
          /* Get the x and y positions of the image: */
          a = img.getBoundingClientRect();
          /* Calculate the cursor's x and y coordinates, relative to the image: */
          x = e.pageX - a.left;
          y = e.pageY - a.top;
          /* Consider any page scrolling: */
          x = x - window.pageXOffset;
          y = y - window.pageYOffset;
          return {x : x, y : y};
        }
      };

      ClassifyTaskFeeder.magnifyToggle = function (imgID, zoom) {
          if(document.getElementsByClassName('img-magnifier-glass')[0]){
            document.getElementsByClassName('img-magnifier-glass')[0].remove()
          }else{
            ClassifyTaskFeeder.magnify("image0", 3); // turns on magnifying glass
          }
          


      };      

    /* Begin Classify app specific functionality */
    // debugger
    ClassifyTaskFeeder.setPrompt();
    ClassifyTaskFeeder.handleUrlFilter(document.location.search);
    ClassifyTaskFeeder.initCheckboxListener();
    ClassifyTaskFeeder.initKeyboardListener();

}


