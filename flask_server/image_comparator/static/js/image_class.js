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
    ClassifyTaskFeeder.keyboardShortcuts = false; // turn keyboard listener on\off

    // - Methods
    ClassifyTaskFeeder.buildUI = function (imageList) {
        // debugger
        if (imageList === "no tasks left") {
            $("#image0").attr('src', "")
            return "no tasks means no UI to build"
        } else {
            // debugger
            this.currentImg = this.imageList[this.currentTask.current_idx]
            // //img0
            this.getBase64DataOfImageFromCouch(this.currentImg.toString(), htmlID = "image0")
                .then(response => {
                    // enable buttons now that submission is over
                    this.enableButtons();
                })
        }
    };

    ClassifyTaskFeeder.classifySubmit = function (selection) {
        console.log("classifySubmit");
        this.disableButtons();
        // Gather all imageIDs
        // debugger
        TF = this;
        const user = this.user;

        const currentTime = new Date();

        const timeStr = currentTime.toString();
        const img0 = `http://${DNS}:${DB_PORT}/${IMAGES_DB}/${this.currentImg}`;
        const task = this.currentTask._id;
        const task_idx = this.currentTask.current_idx;
        // debugger

        const save_results = {
            user: user,
            type: "classifyResult",
            date: timeStr,
            image: img0,
            diagnosis: selection.id,
            task: task,
            task_list_name: this.currentTask.list_name,
            task_idx: task_idx,
        }

        $.ajax({
            url: `http://${DNS}:${HTTP_PORT}/task_results`,
            data: JSON.stringify(save_results),
            dataType: "json",
            type: 'POST',
            contentType: 'application/json',
            success: function (response) {
                // debugger
                console.log('success')
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

    ClassifyTaskFeeder.initKeyboardListener = function () {
        TF = this;
        document.addEventListener('keydown', function (event) {
            if (!($("#rejectModal").css("display") === "block")) {
                if (TF.keyboardShortcuts === false) {
                    if (event.keyCode == 49) {
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
                } else if (TF.keyboardShortcuts === true && document.getElementById("option1").disabled === false) {
                    if (event.keyCode == 49) {
                        $("#not_sure").click()
                    }
                    else if (event.keyCode == 50) {
                        $("#normal").click()
                    }
                    else if (event.keyCode == 51) {
                        $("#gray_zone").click()
                    }
                    else if (event.keyCode == 52) {
                        $("#precancer_cancer").click()
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

    ClassifyTaskFeeder.enableButtons = function () {
        document.getElementById("normal").disabled = false;
        document.getElementById("gray_zone").disabled = false;
        document.getElementById("precancer_cancer").disabled = false;
        document.getElementById("not_sure").disabled = false;
        document.getElementById("previousClassification").disabled = false;
    };

    ClassifyTaskFeeder.disableButtons = function () {
        document.getElementById("normal").disabled = true;
        document.getElementById("gray_zone").disabled = true;
        document.getElementById("precancer_cancer").disabled = true;
        document.getElementById("not_sure").disabled = true;
        document.getElementById("previousClassification").disabled = true;
    };

    /* Begin Classify app specific functionality */
    // debugger
    ClassifyTaskFeeder.setPrompt();
    ClassifyTaskFeeder.handleUrlFilter(document.location.search);
    ClassifyTaskFeeder.initKeyboardListener();

}
