'use strict';
/* VMA Controllers Module */
var vmaControllerModule = angular.module('vmaControllerModule', []);

vmaControllerModule.controller('loginCtrl', ['$scope', 'Auth', '$state', 'ngNotify', '$timeout', 'vmaGroupService', function($scope, Auth, $state, ngNotify, $timeout, vmaGroupService) {
    if($scope.isAuthenticated() === true && !$scope.isGuest) {
        //IF SUCCESSFULLY AUTH-ED USER IS TRYING TO GO TO LOGIN PAGE => SEND TO HOME PAGE OF APP
        $state.go('home.homePage');
    }
    $scope.salt = "nfp89gpe"; //PENDING - NEED TO GET ACTUAL SALT
    $scope.submit = function() {
        if ($scope.userName && $scope.passWord) {
            document.activeElement.blur();
            $scope.passWordHashed = new String(CryptoJS.SHA512($scope.passWord + $scope.userName + $scope.salt));
            Auth.clearCredentials();
            Auth.setCredentials($scope.userName, $scope.passWordHashed);
            vmaGroupService.clear();
            $scope.userName = '';
            $scope.passWord = '';
            $scope.loginResultPromise = $scope.Restangular().all("users").all("myUser").getList();
            $scope.success = false;
            $scope.loginResultPromise.then(function(result) {
                $scope.loginResult = result;
                $scope.loginMsg = "You have logged in successfully!";
                Auth.confirmCredentials();
                $state.go("home.homePage", {}, {reload: true});
                ngNotify.set($scope.loginMsg, 'success');
                $scope.success = true;
            }, function(error) {
                $scope.loginMsg = "Incorrect username or password.";
                ngNotify.set($scope.loginMsg, {position: 'top', type: 'error'});
                Auth.clearCredentials();
                $scope.success = true;
            });
            $timeout(function() {
                if(!$scope.success) {
                    $scope.loginMsg = "Incorrect username or password.";
                    ngNotify.set($scope.loginMsg, {position: 'top', type: 'error'});
                    Auth.clearCredentials();
                } else {
                    //$scope.loginMsg = "Not doing it.";
                    //ngNotify.set($scope.loginMsg, {position: 'top', type: 'error'});
                }
            }, 10000)
        } else {
            $scope.loginMsg = "Please enter a username and password.";
            ngNotify.set($scope.loginMsg, {position: 'top', type: 'error'});
        }
    };
}]);

vmaControllerModule.controller('registerCtrl', ['$scope', '$state', 'Auth', 'ngNotify', function($scope, $state, Auth, ngNotify) {
    $scope.registerUser = function() {
        if(!$scope.register || !$scope.password || !$scope.confirm){
            ngNotify.set("Please fill out all fields!", {position: 'top', type: 'error'});
        } else if($scope.register.username === "" || $scope.register.username === undefined){
            ngNotify.set("Username is required!", {position: 'top', type: 'error'});
        } else if($scope.password.password === "" || $scope.password.password === undefined) {
            ngNotify.set("Password is required!", {position: 'top', type: 'error'});
        } else if($scope.confirm.password === "" || $scope.confirm.password === undefined) {
            ngNotify.set("Please enter password confirmation!", {position: 'top', type: 'error'});
        } else if($scope.password.password !== $scope.confirm.password){
            ngNotify.set("Passwords must match!", {position: 'top', type: 'error'});
        } else {
            Auth.setCredentials("Visitor", "test");
            $scope.salt = "nfp89gpe";
            $scope.register.password = String(CryptoJS.SHA512($scope.password.password + $scope.register.username + $scope.salt));
            $scope.$parent.Restangular().all("users").post($scope.register).then(
                function (success) {
                    Auth.clearCredentials();
                    Auth.setCredentials($scope.register.username, $scope.register.password);
                    Auth.confirmCredentials();
                    ngNotify.set("User account created!", {position: 'top', type: 'success'});
                    $state.go("home.availableClasses", {}, {reload: true});
                }, function (fail) {
                    Auth.clearCredentials();
                    ngNotify.set(fail.data.message, {position: 'top', type: 'error'});
                });
            Auth.clearCredentials();
        }
    }
}]);

vmaControllerModule.controller('settings', ['$scope', '$state', 'Auth', '$ionicModal', '$ionicPopup', function($scope, $state, Auth, $ionicModal, $ionicPopup) {
    //OPENING THE MODAL TO LOG OUT A USER
    $scope.logOutUser = function(id) {
        $scope.openLogOut(id);
    };
    $scope.openLogOut = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Log Out',
            template: 'Are you sure you would like to log out?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $scope.ok();
            } else {

            }
        });
        $scope.ok = function () {
            $scope.out();
        };
    };
    $scope.out = function() {
        Auth.clearCredentials();
        location.reload();
        $state.go("home.homePage", {}, {reload: true});
    }
}]);
// try to comment this out 
vmaControllerModule.controller('userPicture', ['$scope', '$state', 'Auth', '$ionicModal', '$ionicPopup', 'vmaUserService', function($scope, $state, Auth, $ionicModal, $ionicPopup, vmaUserService) {
// vmaControllerModule.controller('userPicture', ['$scope', '$state', 'Auth', 'vmaUserService', function($scope, $state, Auth, vmaUserService) {
    vmaUserService.getAvatarPath($scope.uid).then(function(s){
        $scope.avatarPath = s;
    });
}]);
// try to comment this out 
vmaControllerModule.controller('groupController', ['$scope', '$state', '$ionicModal', 'vmaGroupService', '$timeout', 'ngNotify', '$rootScope', 'vmaTaskService', '$stateParams', '$filter', '$ionicActionSheet', '$ionicPopover', '$ionicPopup', function($scope, $state, $ionicModal, vmaGroupService, $timeout, ngNotify, $rootScope, vmaTaskService, $stateParams, $filter, $ionicActionSheet, $ionicPopover, $ionicPopup) {
// vmaControllerModule.controller('groupController', ['$scope', '$state', '$ionicModal', 'vmaGroupService', '$timeout', 'ngNotify', '$rootScope', 'vmaTaskService', '$stateParams', '$filter', function($scope, $state, $ionicModal, vmaGroupService, $timeout, ngNotify, $rootScope, vmaTaskService, $stateParams, $filter) {
    var state = $state.current.name;
    switch(state) {
        case "home.myGroups":
            $scope.update = function(update) {
                vmaGroupService.getMetaGroups(update).then(function(success) {
                    $scope.groups = success; $scope.$broadcast('scroll.refreshComplete');
                });
            };
            break;
        case "home.joinGroups":
            $scope.update = function(update) {
                vmaGroupService.getMetaGroups(update).then(function(success) {
                    $scope.groups = success;
                    $filter('removeJoined')($scope.groups);
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
            break;
        case "home.group":
            $scope.id = $stateParams.id;
            $scope.update = function(update){
                vmaGroupService.getGroupMeta($scope.id, update).then(function(success) {
                    $scope.group = success; $scope.$broadcast('scroll.refreshComplete');
                });
            };
            $scope.group = $stateParams.group;
            $scope.map = {
                sensor: true,
                size: '800x500',
                zoom: 10,
                center: $scope.group.address,
                markers: [$scope.group.address], //marker locations
                mapevents: {redirect: true, loadmap: false}
            };
            break;
        default:
            $scope.update = function(){};
            console.log("ERROR: UNCAUGHT STATE: ", state);
            return true;
    }
    $scope.updateGroups = $scope.update;
    $scope.update(true);

    //OPENING MODAL TO ADD A GROUP
    $scope.addGroup = function() {
        $scope.openAdd();
    };
    $scope.openAdd = function () {
        // callback for ng-click 'modal'- open Modal dialog to add a new course
        $ionicModal.fromTemplateUrl('partials/addGroup.html', {
            scope : $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.newGroup = {};
            $scope.modal.show();
        });
        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });

        $scope.ok = function () {
            var promise = vmaGroupService.addGroup($scope.newGroup);
            promise.then(function(success) {
                $scope.updateGroups();
                $scope.closeModal();
                ngNotify.set("Center created successfully!", 'success');
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };
    };

    //OPENING THE MODAL TO DELETE A GROUP
    $scope.deleteGroup = function(id) {
        $scope.openDelete(id);
    };
    $scope.openDelete = function (id) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Center',
            template: 'Are you sure you want delete this center?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $scope.ok();
            } else {

            }
        });
        $scope.ok = function () {
            var promise = vmaGroupService.deleteGroup(id);
            promise.then(function(success) {
                $scope.updateGroups();
                ngNotify.set("Center deleted successfully!", 'success');
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };
    };

    //OPENING THE MODAL TO EDIT A GROUP
    $scope.editGroup = function(id) {
        $scope.openEdit(id);
    };
    $scope.openEdit = function (id) {
        // callback for ng-click 'modal'- open Modal dialog to add a new course
        $ionicModal.fromTemplateUrl('partials/editGroup.html', {
            scope : $scope
        }).then(function (modal) {
            $scope.modal = modal;
            vmaGroupService.getGroup(id).then(function(success) { $scope.editGroupNew = angular.copy(success); });
            $scope.modal.show();
        });
        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        $scope.ok = function () {
            delete $scope.editGroupNew.isGroup;
            var promise = vmaGroupService.editGroup(id, $scope.editGroupNew);
            promise.then(function(success) {
                ngNotify.set("Center edited successfully!", 'success');
                $scope.updateGroups(true);
                $scope.closeModal();
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };
    };

    //OPENING THE MODAL TO LEAVE A GROUP
    $scope.leaveGroup = function(id) {
        $scope.openLeave(id);
    };
    $scope.openLeave = function (id) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Leave Center',
            template: 'Are you sure you want to leave this center?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $scope.ok();
            } else {

            }
        });
        $scope.ok = function () {
            var promise = vmaGroupService.leaveGroupMember(id, $scope.uid);
            promise.then(function(success) {
                $scope.updateGroups();
                ngNotify.set("Center left successfully!", 'success');
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };
    };

    //JOINING A GROUP
    $scope.joinGroup = function(id) {
        var jProm = vmaGroupService.joinGroup(id, $scope.uid);
        jProm.then(function(success) {
            $scope.updateGroups();
            ngNotify.set("Center joined successfully!", 'success');
        }, function(fail) {
            ngNotify.set(fail.data.message, 'error');
        });
    };

    //VIEW POSTS
    $scope.viewPost = function(pid) {
        $state.go("home.group.posts.comments", {"post_id" : pid}, [{reload: false}]);
    };

    //VIEW GROUP
    $scope.viewGroup = function(gid) {
        $state.go("home.group", {"id" : gid});
    };

    //PERMISSIONS
    $scope.generateActions = function(id) {
        var actionObj = $filter('getById')($scope.groups, id);
        var ionicActionArray = [];
        if(actionObj.isManager || $scope.isAdm || $scope.isMod) {
            ionicActionArray.push(
                { text: 'Edit' },
                { text: 'Delete' }
                //{ text: 'Leave' }
            );
        } else if(actionObj.isMember){
            //ionicActionArray.push(
            //    { text: 'Leave' }
            //);
        } else {
            //ionicActionArray.push(
            //    { text: 'Join' }
            //);
        }
        return ionicActionArray;
    };

    //PERMISSION SHOW CHECK
    $scope.actionCount = function(id) {
        if($scope.generateActions(id).length > 0) return true; else return false;
    };

    $ionicPopover.fromTemplateUrl('partials/popoverOptsArray.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    //ACTION SHEET
    $scope.showActions = function(id, event0) {
        var ionicActions = $scope.ionicActions = $scope.generateActions(id);
        $scope.popOverStyle = {width:'150px', height: $scope.ionicActions.length*55 + "px"};
        $scope.popover.show(event0);
        $scope.click = function(action) {
            $scope.popOverClick(action,id);
        }
    };

    $scope.popOverClick = function(action, id) {
        switch(action) {
            case "Edit":
                $scope.editGroup(id);
                break;
            case "Delete":
                $scope.deleteGroup(id);
                break;
            case "Leave":
                $scope.leaveGroup(id);
                break;
            default:
                return true;
        }
        $scope.popover.hide();
        return true;
    };

    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if($scope.modal && $scope.modal.isShown()) {
            event.preventDefault();
        }
    });
}]);
// try to comment this out 
vmaControllerModule.controller('taskController', ['$scope', '$state', '$ionicModal', 'vmaGroupService', '$timeout', 'ngNotify', '$rootScope', 'vmaTaskService', '$stateParams', '$filter', '$ionicActionSheet', '$ionicPopup', '$ionicPopover', function($scope, $state, $ionicModal, vmaGroupService, $timeout, ngNotify, $rootScope, vmaTaskService, $stateParams, $filter, $ionicActionSheet, $ionicPopup, $ionicPopover) {
// vmaControllerModule.controller('taskController', ['$scope', '$state', '$ionicModal', 'vmaGroupService', '$timeout', 'ngNotify', '$rootScope', 'vmaTaskService', '$stateParams', '$filter', function($scope, $state, $ionicModal, vmaGroupService, $timeout, ngNotify, $rootScope, vmaTaskService, $stateParams, $filter) {
    $scope.getItemHeight = function(item, index) {
        return 150;
    };

    $ionicPopover.fromTemplateUrl('partials/popOver.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.filterpopover = popover;
    });

    $scope.openfilterPopover = function($event) {
        $scope.filterpopover.show($event);
    };

    $scope.badgeMultiSelect = [];
    $scope.badgeConfig.forEach(function(badge){
        $scope.badgeMultiSelect.push({name: badge, ticked: true});
    });
    $scope.$watch('output', function(val) {
        $scope.indexCoresInput = $filter('convertToIndex')($scope.output,$scope.badgeConfig);
    });

    var state = $state.current.name;
    switch(state) {
        case "home.myTasks":
            $scope.updateTasks = function(refresh) {
                return vmaTaskService.getJoinTasks(refresh).then(function(success) {
                    $scope.tasks = success; $scope.$broadcast('scroll.refreshComplete');
                });
            };
            break;
        case "home.group":
            $scope.updateTasks = function(update){
                return vmaTaskService.getAllTasksGroup($scope.id, update).then(function(success) {
                    $scope.tasks = success;
                    var tasks_temp = $scope.tasks;
                    $scope.tasks = [];
                    tasks_temp.forEach(function(task) {
                        if(!task.finished || task.finished != 1) $scope.tasks.push(task);
                    });
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
            break;
        case "home.group.tasks":
            $scope.id = $stateParams.id;
            $scope.updateTasks = function(update) {
                vmaGroupService.getGroupMeta($scope.id).then(function(success){
                    $scope.isMod = success.isManager;
                });
                return vmaTaskService.getMetaTasksGroup($scope.id, update).then(function(success) {
                    $scope.tasks = success;
                    var tasks_temp = $scope.tasks;
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
            break;
        case "home.availableClasses":
            $scope.id = $stateParams.id;
            $scope.updateTasks = function(update) {
                return vmaTaskService.getMetaTasks(update).then(function(success) {
                    success.forEach(function(s){
                        vmaGroupService.getGroup(s.location_id).then(function(success){
                            s.group = success;
                        });
                        vmaGroupService.isManager(s.group_id).then(function(s) {
                            $scope.isMan = s;
                        });
                    });
                    $scope.tasks = success;
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
            break;
        default:
            $scope.update = $scope.updateTasks = function(){};
            console.log("ERROR: UNCAUGHT STATE: ", state);
            break;
    }
    $scope.updateTasks(true);

    //VIEW A TASK
    $scope.viewTask = function(click_id) {
        vmaTaskService.getTaskView(click_id).then(function(success){
            $state.go("home.task", {"task" : click_id});
        });
    };
    //VIEW MESSAGES
    $scope.displayMessages = function(click_id) {
        $state.go('home.message', {id:click_id}, {reload: false});
    };

    //OPENING THE MODAL TO ADD A TASK
    $scope.addTask = function () {
        $scope.openAdd();
    };
    $scope.openAdd = function () {
        $scope.newTask = {};
        $scope.badgeOptions = $scope.badgeConfig;
        $ionicModal.fromTemplateUrl('partials/addTask.html', {
            scope : $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.newTask = {};
            $scope.modal.show();
        });
        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        $scope.ok = function () {
            $scope.newTask.location_id = $scope.id;
            //$scope.newTask.cores = [];
            //$scope.newTask.cores.push($scope.badgeOptions.indexOf($scope.chosenBadge.name));
            var promise = vmaTaskService.addTask($scope.newTask);
            promise.then(function(success) {
                $scope.updateTasks(true);
                $scope.closeModal();
                ngNotify.set("Class added successfully", "success");
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };
    };

    //OPENING THE MODAL TO EDIT A TASK
    $scope.editTaskFunction = function (task_id) {
        $scope.openEdit(task_id);
    };
    $scope.openEdit = function (task_id) {
        $scope.badgeOptions = $scope.badgeConfig;
        // callback for ng-click 'modal'- open Modal dialog to add a new course
        $ionicModal.fromTemplateUrl('partials/editTask.html', {
            scope : $scope
        }).then(function (modal) {
            $scope.modal = modal;
            vmaTaskService.getTaskPure(task_id).then(function(success) {
                $scope.editTask = success;
                if($scope.editTask.time)
                    $scope.editTask.time = new Date($scope.editTask.time);
                else
                    $scope.editTask.time = null;
            });
            $scope.modal.show();
        });
        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        $scope.ok = function () {
            var promise = vmaTaskService.editTask(task_id, $scope.editTask);
            promise.then(function(success) {
                ngNotify.set("Class edited successfully", "success");
                $scope.updateTasks(true);
                $scope.closeModal();
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };
        $scope.duplicate = function() {
            $scope.editTask.id = null;
            var promise = vmaTaskService.addTask($scope.editTask);
            promise.then(function(success) {
                $scope.updateTasks(true);
                $scope.closeModal();
                ngNotify.set("Class duplicated successfully", "success");
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };
    };

    //OPENING THE MODAL TO DELETE A TASK
    $scope.deleteTask = function (task_id) {
        $scope.openDelete(task_id);
    };
    $scope.openDelete = function (task_id) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Class',
            template: 'Are you sure you want to delete this class?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $scope.ok();
            } else {

            }
        });

        $scope.ok = function () {
            var promise = vmaTaskService.deleteTask(task_id);
            promise.then(function(success) {
                $scope.updateTasks(true);
                ngNotify.set("Class deleted successfully", "success");
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };
    };

    //JOINING A TASK
    $scope.joinTask = function(task_id) {
        var promise = vmaTaskService.joinTask(task_id, $scope.uid);
        $ionicLoading.show();
        promise.then(function(success) {
            $scope.updateTasks(true).then(function(){
                $ionicLoading.hide();
                ngNotify.set("Class added to My Wish List successfully", "success");
            });
        }, function(fail) {
            $ionicLoading.hide();
            ngNotify.set(fail.data.message, 'error');
        });
    };

    //LEAVING A TASK
    $scope.leaveTask = function(task_id) {
        var promise = vmaTaskService.leaveTaskMember(task_id, $scope.uid);
        $ionicLoading.show();
        promise.then(function(success) {
            $scope.updateTasks(true).then(function(){
                $ionicLoading.hide();
                ngNotify.set("Class Removed from My Wish List successfully", "success");
            });
        }, function(fail) {
            $ionicLoading.hide();
            ngNotify.set(fail.data.message, 'error');
        });
    };

    $scope.markFinished = function(task_id) {
        vmaTaskService.markFinished(task_id).then(function(){ngNotify.set("Class marked complete successfully", "success");});
    };

    $scope.markUnFinished = function(task_id) {
        vmaTaskService.markUnFinished(task_id).then(function(){ngNotify.set("Class marked incomplete successfully", "success");});
    };

    //OPENING DATE/TIME PICKER
    $scope.openDatePicker = function () {
        $scope.tmp = {};
        $scope.tmp.newDate = $scope.newTask.time;
        $ionicPopup.show({
            template: '<datetimepicker data-ng-model="tmp.newDate"></datetimepicker>',
            title: "Class Date & Time",
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.newTask.time = $scope.tmp.newDate;
                    }
                }
            ]
        });
    };

    //OPENING DATE/TIME PICKER
    $scope.openDatePickerEdit = function () {
        $scope.tmp = {};
        $scope.tmp.newDate = $scope.editTask.time;
        $ionicPopup.show({
            template: '<datetimepicker data-ng-model="tmp.newDate" ></datetimepicker>',
            title: "Class Date & Time",
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.editTask.time = $scope.tmp.newDate;
                    }
                }
            ]
        });
    };

    //PERMISSIONS
    $scope.generateActions = function(id) {
        var actionObj = $filter('getById')($scope.tasks, id);
        var ionicActionArray = [];
        if(actionObj.isManager || actionObj.isGroupManager || $scope.isAdm || $scope.isMod) {
            ionicActionArray.push(
                { text: 'Edit' },
                { text: 'Delete' }
            );

            //if(!actionObj.finished)
            //    ionicActionArray.push({text: 'Complete'});
            //else
            //    ionicActionArray.push({text: 'Incomplete'});
        }
        return ionicActionArray;
    };

    //PERMISSION SHOW CHECK
    $scope.actionCount = function(id) {
        return ($scope.generateActions(id).length > 0);
    };

    $ionicPopover.fromTemplateUrl('partials/popoverOptsArray.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });


    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };

    //ACTION POPUP
    $scope.showActions = function(id, event0) {
        $scope.ionicActions = $scope.generateActions(id);
        $scope.popOverStyle = {width:'150px', height: $scope.ionicActions.length*55 + "px"};
        $scope.popover.show(event0);
        $scope.click = function(action) {
            $scope.popOverClick(action,id);
        }
    };

    $scope.popOverClick =  function(action, id) {
        switch(action) {
            case "Edit":
                $scope.editTaskFunction(id);
                break;
            case "Delete":
                $scope.deleteTask(id);
                break;
            case "Leave":
                $scope.leaveTask(id);
                break;
            case "Join":
                $scope.joinTask(id);
                break;
            case "Complete":
                $scope.markFinished(id);
                break;
            case "Incomplete":
                $scope.markUnFinished(id);
                break;
            default:
                return true;
        }
        $scope.popover.hide();
        return true;
    };

    //VIEW GROUP
    $scope.viewGroup = function(gid) {
        $state.go("home.group", {"id" : gid});
    };

    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if($scope.modal && $scope.modal.isShown()) {
            $scope.modal.remove();
            event.preventDefault();
        }
    });
}]);

vmaControllerModule.controller('task', ['$scope', '$state', '$stateParams', 'task', function($scope, $state, $stateParams, task) {
    $scope.task = task;

    if($scope.task.address)
        $scope.map = {
            sensor: true,
            size: '800x500',
            zoom: 10,
            center: $scope.task.address,
            markers: [$scope.task.address], //marker locations
            mapevents: {redirect: true, loadmap: false}
        };
}]);

vmaControllerModule.controller('efforts', ['$scope', function($scope) {
    $scope.invites = [
        {id:'3', group_name: "GROUP 3", icon: "img/temp_icon.png"},
        {id:'4', group_name: "GROUP 4", icon: "img/temp_icon.png"},
        {id:'5', group_name: "GROUP 5", icon: "img/temp_icon.png"},
        {id:'6', group_name: "GROUP 6", icon: "img/temp_icon.png"}
    ];
}]);
// try to comment this out 
vmaControllerModule.controller('hours.moderation', ['$scope', '$state', '$stateParams', '$ionicModal', '$rootScope', 'ngNotify', 'vmaTaskService', 'vmaHourService', '$ionicLoading', function($scope, $state, $stateParams, $modal, $rootScope, ngNotify, vmaTaskService, vmaHourService, $ionicLoading) {
// vmaControllerModule.controller('hours.moderation', ['$scope', '$state', '$stateParams', '$rootScope', 'ngNotify', 'vmaTaskService', 'vmaHourService', function($scope, $state, $stateParams, $rootScope, ngNotify, vmaTaskService, vmaHourService) {
    //$scope.notReachedEnd = true;
    $scope.pending = true;
    $scope.query = "";
    $scope.update = function() {
        $ionicLoading.show();
        vmaHourService.getHours(1000000000, null, $stateParams.group_id, $scope.pending).then(function(success) {
            $scope.entries = success;
            $ionicLoading.hide();
            //$scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    $scope.switchAndUpdate = function() {
        $scope.pending = !$scope.pending;
        $scope.update();
    };

    $scope.update();

    $scope.entry = [];

    $scope.approve = function(h_id) {
        vmaHourService.approveHour(h_id).then(function(){ngNotify.set("Hour approved successfully", "success"); $scope.update();});
    };

    $scope.deny = function(h_id) {
        vmaHourService.denyHour(h_id).then(function(){ngNotify.set("Hour disapproved successfully", "success"); $scope.update();});
    }
}]);
// try to comment this out 
vmaControllerModule.controller('hoursController', ['$scope', '$state', '$stateParams', '$ionicModal', '$rootScope', 'ngNotify', 'vmaTaskService', 'vmaHourService', '$ionicPopup', 'Camera', '$filter', '$upload', '$timeout', '$http', function($scope, $state, $stateParams, $ionicModal, $rootScope, ngNotify, vmaTaskService, vmaHourService, $ionicPopup, Camera, $filter, $upload, $timeout, $http) {
// vmaControllerModule.controller('hoursController', ['$scope', '$state', '$stateParams', '$rootScope', 'ngNotify', 'vmaTaskService', 'vmaHourService', 'Camera', '$filter', '$upload', '$timeout', '$http', function($scope, $state, $stateParams, $rootScope, ngNotify, vmaTaskService, vmaHourService, Camera, $filter, $upload, $timeout, $http) {
    $scope.imageArr = [];
    $scope.isWebView = ionic.Platform.isIOS() || ionic.Platform.isAndroid();
    $scope.pictureTake = false;
    $scope.getPhoto = function() {
        var cameraOptions = {
            quality: 50,
            correctOrientation: true
//              destinationType: navigator.camera.DestinationType.FILE_URI
        };
        Camera.getPicture().then(function(imageURI) {
            $scope.lastPhoto = imageURI;
            $scope.pictureTake = true;
        }, function(err) {
        }, {
            quality: 75,
            targetWidth: 320,
            targetHeight: 320,
            saveToPhotoAlbum: false
        });
    };
        $scope.goToLink = function(url){
            
            window.open(url,"blank");
        }
    $scope.uploadPhoto = function(imageURI, id) {

        //selected photo URI is in the src attribute (we set this on getPhoto)
//        var imageURI = document.getElementById('smallImage').getAttribute("src");
        if (!imageURI) {
            alert('Please select an image first.');
            return;
        }

        //set upload options
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;

//        options.params = {
//            firstname: document.getElementById("firstname").value,
//            lastname: document.getElementById("lastname").value,
//            workplace: document.getElementById("workplace").value
//        }

        options.headers = {
            "Authorization": $http.defaults.headers.common['Authorization']
        }

        var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI($scope.serverRootUpload+'hours/upload?id=' + id), onSuccess, onFail, options);
    }
    function onSuccess(imageData) { }
//        function onFail(message) {
//            alert('Fail' );
//            alert('Failed because: ' + error.code);
//        }
    var onFail = function (error) {
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
    };

    $scope.upload = function() {
        var url = '';
        var fd = new FormData();

        //previously I had this
        //angular.forEach($scope.files, function(file){
        //fd.append('image',file)
        //});

        fd.append('image', $scope.lastPhoto);

        $http.post(url, fd, {

            transformRequest:angular.identity,
            headers:{'Content-Type':undefined
            }
        })
            .success(function(data, status, headers){
                $scope.imageURL = data.resource_uri; //set it to the response we get
            })
            .error(function(data, status, headers){

            })
    }
    /*function dataURItoBlob(dataURI) {
     // convert base64/URLEncoded data component to raw binary data held in a string
     var byteString = atob(dataURI.split(',')[1]);
     var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

     var ab = new ArrayBuffer(byteString.length);
     var ia = new Uint8Array(ab);
     for (var i = 0; i < byteString.length; i++)
     {
     ia[i] = byteString.charCodeAt(i);
     }

     var bb = new Blob([ab], { "type": mimeString });
     return bb;
     }
     function(err) {
     console.err(err);
     }, {
     quality: 75,
     targetWidth: 320,
     targetHeight: 320,
     saveToPhotoAlbum: false
     });
     };*/
    $scope.onFileSelect = function ($files) {
        $scope.selectedFiles = [];
        $scope.progress = [];
        if ($scope.upload && $scope.upload.length > 0) {
            for (var i = 0; i < $scope.upload.length; i++) {
                if ($scope.upload[i] !== null) {
                    $scope.upload[i].abort();
                }
            }
        }
        $scope.upload = [];
        $scope.uploadResult = [];
        $scope.selectedFiles = $files;
        $scope.dataUrls = [];
        for (var i = 0; i < $files.length; i++) {
            var $file = $files[i];

            $scope.fileName = $file.name;
            // Tracks names of all files that are uploaded
//            $scope.uploadedFileNames.push($scope.fileName);
            // Add uploaded image name to imageArr
            //$scope.imageArr.push($scope.fileName);

            if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL($files[i]);
                var loadFile = function (fileReader, index) {
                    fileReader.onload = function (e) {
                        $timeout(function () {
                            $scope.dataUrls[index] = e.target.result;
                        });
                    };
                }(fileReader, i);
            }
            $scope.progress[i] = -1;
//            if ($scope.uploadRightAway) {
//                $scope.start(i);
//            }
        }
    };

    $scope.update = function() {
        vmaTaskService.getJoinTasks().then(function(success) {
            //$scope.joinTasks = success;
            var tasks_temp = success;
            $scope.joinTasks = [];
            tasks_temp.forEach(function(task) {
                if(task.finished != 1) $scope.joinTasks.push(task);
            });
        });
        vmaHourService.getMyHours(100000, null, null, false).then(function(success) { $scope.entries = success;});
    };

    $scope.start = function (index, id) {
        $scope.progress = {};
        $scope.progress[index] = 0;
        $scope.errorMsg = null;

        //$upload.upload()
        $scope.upload[index] = $upload.upload({
            url: $scope.serverRootUpload+'hours/upload?id=' + id,
            data: {
                myModel: $scope.myModel,
                errorCode: $scope.generateErrorOnServer && $scope.serverErrorCode,
                errorMessage: $scope.generateErrorOnServer && $scope.serverErrorMsg
            },
            file: $scope.selectedFiles[index],
            fileName: $scope.fileName // to modify the name of the file(s)
            //fileFormDataName: 'myFile'
        });
        $scope.upload[index].then(function (response) {
            $timeout(function () {
                $scope.uploadResult.push(response.data);
                // Update imageArr after upload
                $scope.imageArr.push($scope.fileName);
            });
        }, function (response) {


            if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
            // Math.min is to fix IE which reports 200% sometimes
            $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
        $scope.upload[index].xhr(function (xhr) {});
    };
    $scope.camStart = function (index, id) {
        $scope.progress = {};
        $scope.progress[index] = 0;
        $scope.errorMsg = null;

        //$upload.upload()
        $scope.upload[index] = $upload.upload({
            url: $scope.serverRootUpload+'hours/upload?id=' + id,
            data: {
                myModel: $scope.myModel,
                errorCode: $scope.generateErrorOnServer && $scope.serverErrorCode,
                errorMessage: $scope.generateErrorOnServer && $scope.serverErrorMsg
            },
            file: $scope.lastPhoto,
            fileName: $scope.lastPhoto.substr($scope.lastPhoto.lastIndexOf('/')+1)// to modify the name of the file(s)
        });
        $scope.upload[index].then(function (response) {
            $timeout(function () {
                $scope.uploadResult.push(response.data);
                // Update imageArr after upload
                $scope.imageArr.push($scope.lastPhoto.substr($scope.lastPhot.lastIndexOf('/')+1));
            });
        }, function (response) {


            if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
            // Math.min is to fix IE which reports 200% sometimes
            $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
        $scope.upload[index].xhr(function (xhr) {});
    };
    $scope.update();

    $scope.entry = [];
    $scope.entry.name = "Choose a class";
    $scope.ok = function() {
        if ($scope.entry.name == "Choose a class") {ngNotify.set("Please choose a class", "error");}
        else {
            if($scope.entry.name != "Other") {
                var taskSelected = $filter('getByName')($scope.joinTasks, $scope.entry.name);
                $scope.hourEntry = {user_id: $rootScope.uid, title: $scope.entry.name, start_time: $scope.tmp.newDate, duration: Math.ceil($scope.entry.duration), task_id: taskSelected.id};
            } else {
//                var a = $scope.tmp.newDate != 'undefined';
                try{
                    $scope.hourEntry = {user_id: $rootScope.uid, title: $scope.entry.customName, start_time: $scope.tmp.newDate, duration: Math.ceil($scope.entry.duration)};
                }catch(e){
                    ngNotify.set("Please fill required fields", "error");
                    $scope.hourEntry = {user_id: $rootScope.uid, title: $scope.entry.customName, duration: Math.ceil($scope.entry.duration)};
                }
            }
            if($scope.hourEntry.title && $scope.hourEntry.duration && $scope.tmp)
                vmaHourService.addHours($scope.hourEntry).then(function(success) {
                    $scope.update();
                    $scope.entry = [];
                    $scope.entry.name = "Choose a class";
                    ngNotify.set("Successfully submitted hour entry!", "success");
                    if($scope.isWebView){
//                    $scope.start(0, success.id);
//                    $scope.camStart(0, success.id);
                        $scope.uploadPhoto($scope.lastPhoto, success.id);
                    }
                    else
                        $scope.start(0, success.id);

                },function(fail){
                    ngNotify.set("Error!", "error");
                });
            else
                ngNotify.set("Please fill required fields", "error");
        }
    };
    $scope.$watch('entry.name', function(taskName) {
        if(taskName != "Other")
            vmaTaskService.getTaskByName(taskName).then(function(success){
                if(success) {
                    if (success.time) {
                        if(!$scope.tmp)
                            $scope.tmp = {};

                        $scope.tmp.newDate = $scope.entry.inTime =  $filter('date')(success.time,"yyyy-MM-dd'T'HH:mm:ssZ");
                        $scope.entry.inTime = $filter('date')(success.time,'MM/dd/yyyy @ h:mma');
                    }
                    if (success.duration)
                        $scope.entry.duration = success.duration;
                }
            })
    });
    $scope.deleteHour = function(h_id){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete',
            template: 'Are you sure you would like to delete this hour?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $scope.ok();
            } else {

            }
        });
        $scope.ok = function () {
                  vmaHourService.deleteHour(h_id).then(function(success) {
                    $scope.update();
                    $scope.entry = [];
                    ngNotify.set("Successfully deleted hour entry!", "success");
                },function(fail){
                    ngNotify.set("Error!", "error");
                });
        };
//      vmaHourService.deleteHour(h_id).then(function(success) {
//                    $scope.update();
//                    $scope.entry = [];
//                    ngNotify.set("Successfully deleted hour entry!", "success");
//                },function(fail){
//                    ngNotify.set("Error!", "error");
//                });
    };
    //OPENING THE MODAL TO DELETE A MESSAGE
    $scope.delete = function(h_id) {
        $scope.openDelete(h_id);
    };
    $scope.openDelete = function (id) {
        var modalInstance = $modal.open({
            templateUrl: 'partials/deleteHour.html',
            controller: ModalInstanceCtrlDelete,
            resolve: {
                deleteId: function() {
                    return id;
                },
                window_scope: function() {
                    return $scope;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
//          $scope.selected = selectedItem;
        }, function () {
//          What to do on dismiss
//          $log.info('Modal dismissed at: ' + new Date());
        });
    };
    //Controller for the Modal PopUp Delete
    var ModalInstanceCtrlDelete = function ($scope, $modalInstance, deleteId, window_scope) {
        $scope.ok = function () {
            var promise = vmaHourService.deleteHour(deleteId);
            promise.then(function(success) {
                window_scope.update();
                ngNotify.set("Hour entry deleted successfully!", 'success');
                $modalInstance.close();
            }, function(fail) {
                ngNotify.set(fail.data.message, 'error');
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
            $modalInstance.dismiss('cancel');
            //Prevents the switching of the state
            event.preventDefault();
        });
    };

    $scope.openDatePicker = function () {
        if(!$scope.tmp)
            $scope.tmp = {};
        $ionicPopup.show({
            template: '<datetimepicker data-ng-model="tmp.newDate"></datetimepicker>',
            title: "Class Date & Time",
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.entry.inTime = $filter('date')($scope.tmp.newDate,'MM/dd/yyyy @ h:mma');
                    }
                }
            ]
        });
    };

    function fail(error) {
        console.log(error.code);
    }

}]);

vmaControllerModule.controller('awards', ['$scope', 'tasks', function ($scope, tasks) {
//    PULL THIS IN FROM USER_DATA
    $scope.badges = [
        [$scope.badgeConfig[0], tasks[0]],
        [$scope.badgeConfig[1], tasks[1]],
        [$scope.badgeConfig[2], tasks[2]],
        [$scope.badgeConfig[3], tasks[3]],
        [$scope.badgeConfig[4], tasks[4]]
    ];

    $scope.total_hours = tasks[0] + tasks[1] + tasks[2] + tasks[3] + tasks[4];
    if($scope.total_hours != 0) {
        $scope.badge1_percent = Math.round($scope.badges[0][1] / $scope.total_hours * 100);
        $scope.badge2_percent = Math.round($scope.badges[1][1] / $scope.total_hours * 100);
        $scope.badge3_percent = Math.round($scope.badges[2][1] / $scope.total_hours * 100);
        $scope.badge4_percent = Math.round($scope.badges[3][1] / $scope.total_hours * 100);
        $scope.badge5_percent = Math.round($scope.badges[4][1] / $scope.total_hours * 100);
    } else {
        $scope.badge1_percent = 0;
        $scope.badge2_percent = 0;
        $scope.badge3_percent = 0;
        $scope.badge4_percent = 0;
        $scope.badge5_percent = 0;
    }
    $scope.chartConfig = {
        options: {
            chart: {
                type: 'pie',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false

            },
            title: {
                text: ''
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true
                    },
                    showInLegend: false
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Hours',
            data: $scope.badges
        }],
        loading: false
    }

}]);
// try to comment this out 
vmaControllerModule.controller('calendar', ['$scope', '$state', 'vmaTaskService', '$ionicScrollDelegate', function($scope, $state, vmaTaskService, $ionicScrollDelegate) {
// vmaControllerModule.controller('calendar', ['$scope', '$state', 'vmaTaskService', function($scope, $state, vmaTaskService) {
    //ACCESSES SERVER AND UPDATES THE LIST OF TASKS

    $scope.updateTasksAndDisplayCalendar = function() {
        vmaTaskService.getCalTasks($scope.id).then(function(success) {
            $scope.calTasks = success;
            displayFullCalendar($scope.calTasks);
            $ionicScrollDelegate.resize();
        });
    };

    $scope.updateTasksAndDisplayCalendar();
}]);
// try to comment this out 
vmaControllerModule.controller('menuCtrl', ['$scope', '$state', '$ionicSideMenuDelegate', function($scope, $state, $ionicSideMenuDelegate) {
// vmaControllerModule.controller('menuCtrl', ['$scope', '$state', function($scope, $state) {
    $scope.state = $state;
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

}]);
// try to comment this out 
vmaControllerModule.controller('homeCtrl', ['$scope', '$state', '$ionicSideMenuDelegate', 'groups', function($scope, $state, $ionicSideMenuDelegate, groups) {
// vmaControllerModule.controller('homeCtrl', ['$scope', '$state', 'groups', function($scope, $state, groups) {
    $scope.state = $state;
}]);
// try to comment this out 
vmaControllerModule.controller('about', ['$scope', '$state', '$ionicSideMenuDelegate', function($scope, $state, $ionicSideMenuDelegate) {
// vmaControllerModule.controller('about', ['$scope', '$state', function($scope, $state) {
    $scope.state = $state;
}]);
// try to comment this out 
vmaControllerModule.controller('intro', ['$rootScope','$scope','$state', '$ionicSlideBoxDelegate','$ionicSideMenuDelegate', function($rootScope, $scope, $state, $ionicSlideBoxDelegate,$ionicSideMenuDelegate) {
// vmaControllerModule.controller('intro', ['$rootScope','$scope','$state', function($rootScope, $scope, $state) {
    //$ionicSideMenuDelegate.$getByHandle('menu').canDragContent(false);
        // $rootScope.curState = $state.current.name;
        // $rootScope.prevState = $rootScope.curState;
        $scope.startApp = function() {
            $state.go('home.homePage');
        };
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };
        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
}]);
