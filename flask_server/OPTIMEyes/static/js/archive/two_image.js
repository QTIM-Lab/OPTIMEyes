/* Feeder inherits from default.js */

var CompareTaskFeeder = {}; // Meant to be global

function init_app() {
    // debugger
    // Update global app feeder variable
    const config_obj = {
        endpoint_image_list: "image_compare_lists",
        message: "Based upon what you observe in these images and considering the criteria for ablation (i.e., area requiring treatment should be completely visible and accessible), which of the two cervices is more suitable for ablation?",
        app: "compare"
    }
    CompareTaskFeeder = new TaskFeeder(config_obj);
    // Override methods and attributes of interest

    // - Attributes
    CompareTaskFeeder.currentPair = [];
    CompareTaskFeeder.nextPair = [];
    CompareTaskFeeder.keyboardShortcuts = false; // turn keyboard listener on\off
    
    // - Methods
    CompareTaskFeeder.buildUI = function (imageList) {
        if (imageList === "no tasks left") {
            // debugger
            $("#image0").attr('src', "")
            $("#image1").attr('src', "")
            return "no tasks means no UI to build"
        } else {
            // debugger
            this.currentPair = this.imageList[this.currentTask.current_idx]
            // //img0
            var idx0 = this.currentPair[0];
            // //img1
            var idx1 = this.currentPair[1];

            this.getBase64DataOfImageFromCouch(idx0.toString(), htmlID = "image0")
            .then((response)=>{
                this.getBase64DataOfImageFromCouch(idx1.toString(), htmlID = "image1")
                .then((response)=>{
                    // debugger
                  this.enableButtons();
                })
            })

            
        }
    };

    CompareTaskFeeder.compareSubmit = function (selection) {
        console.log("compareSubmit");
        this.disableButtons();
        // Gather all imageIDs
        TF = this;
        const user = this.user;

        const currentTime = new Date();

        const timeStr = currentTime.toString();
        const img0 = `http://${DNS}:${DB_PORT}/${IMAGES_DB}/${this.currentPair[0]}`;
        const img1 = `http://${DNS}:${DB_PORT}/${IMAGES_DB}/${this.currentPair[1]}`;
        const winnerId = selection;
        // If Tie not mandatory and all submissions require comment or at least an optional comment
        const comment = $("#justification").val();
        const task = this.currentTask._id;
        const task_idx = this.currentTask.current_idx;
        // debugger

        const save_results = {
            user: user,
            type: "compareResult",
            date: timeStr,
            image0: img0,
            image1: img1,
            winner: winnerId,
            justification: comment,
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


    CompareTaskFeeder.commentAlert = function () {
        alert('If you want to provide an optional justification for your decision (left/right/tie), please enter it before you click left/right/tie. The text box will refresh after a decision is made.')
    }

    CompareTaskFeeder.initKeyboardListener = function () {
        TF = this;
        document.addEventListener('keydown', function (event) {
            if (!($("#rejectModal").css("display") === "block")) {
                if (TF.keyboardShortcuts === false) {
                    if(event.keyCode == 37) {
                        alert('Left was pressed');
                    }
                    else if(event.keyCode == 39) {
                        alert('Right was pressed');
                    }
                    else if(event.keyCode == 40) {
                        alert('Down was pressed');
                    }
                    else if(event.keyCode == 38) {
                        alert('Up was pressed');
                    }
                    
                } else if (TF.keyboardShortcuts === true && document.getElementById('image0').style.pointerEvents === 'auto') {
                    if(event.keyCode == 37) {
                        debugger
                        // CompareTaskFeeder.compareSubmit(1)
                        $("#image0").click()
                    }
                    else if(event.keyCode == 39) {
                        debugger
                        $("#image1").click()
                        // CompareTaskFeeder.compareSubmit(0)
                    }
                    else if(event.keyCode == 40) {
                        debugger
                        $("#tie-button2").click()
                        // CompareTaskFeeder.compareSubmit(-2)
                    }
                    else if(event.keyCode == 38) {
                        debugger
                        $("#tie-button1").click()
                        // CompareTaskFeeder.compareSubmit(-1)
                    }
                }
            }
        });
    };

    CompareTaskFeeder.toggleKeyboardShortcuts = function () {
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

    CompareTaskFeeder.enableButtons = function () {
        document.getElementById('image0').style.pointerEvents = 'auto';
        document.getElementById('tie-button1').style.pointerEvents = 'auto';
        document.getElementById('tie-button2').style.pointerEvents = 'auto';
        document.getElementById('image1').style.pointerEvents = 'auto';

    };

    CompareTaskFeeder.disableButtons = function () {
        document.getElementById('image0').style.pointerEvents = 'none';
        document.getElementById('tie-button1').style.pointerEvents = 'none';
        document.getElementById('tie-button2').style.pointerEvents = 'none';
        document.getElementById('image1').style.pointerEvents = 'none';
    };


    /* Begin Compare app specific functionality */
    // debugger
    CompareTaskFeeder.setPrompt();
    CompareTaskFeeder.handleUrlFilter(document.location.search);
    CompareTaskFeeder.initKeyboardListener();


}
