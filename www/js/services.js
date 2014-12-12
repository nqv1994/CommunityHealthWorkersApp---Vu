'use strict';

var vmaServices = angular.module('vmaServicesModule', ['restangular']);
vmaServices.factory('vmaUserService', ['Restangular', '$q', '$filter', function(Restangular, $q, $filter) {
    var allUsers;
    var promAllUsers;
    var myUser;
    var updating;
    return {
        updateUsers:
            //ACCESSES SERVER AND UPDATES THE LIST OF USERS
            function(update) {
                if(update || (!allUsers && !updating)) {
                    promAllUsers = Restangular.all("users").getList();
                    updating = true;
                    promAllUsers.then(function(success) {
                        updating = false;
                        success = Restangular.stripRestangular(success);
                        allUsers = success;
                    }, function(fail) {

                    });
                    return promAllUsers;
                } else if(updating) {
                    return promAllUsers;
                } else {
                    var defer = $q.defer();
                    defer.resolve("DONE");
                    return defer.promise;
                }
            },
        getAllUsers:
            function() {
                return this.updateUsers().then(function(success) {
                    return allUsers;
                });
            },
        getMyUser:
            function() {
                return Restangular.all("users").all("myUser").getList();
            },
        getUser:
            function(user_id) {
                return this.updateUsers().then(function(success) {
                    return $filter('getById')(allUsers, user_id);
                });
            },
        getMyRole:
            function() {
                return Restangular.all("users").all("myRole").getList().then(function(success) { return success[0]; });
            },
        addUser:
            function(user) {
                return Restangular.all("users").post(user);
            },
        editUser:
            function(id, user) {
                 return Restangular.all("users").all(id).post(user);
            },
        deleteUser:
            function(uid) {
                return Restangular.all("users").all(uid).remove();
            },
        getAvatarPath:
            function(id) {
                return this.getMyUser(id).then(function(s){
                    console.log(Restangular.stripRestangular(s));
                    s = s[0];
                    console.log(s);
                    return "http://housuggest.org/CoreVMA/users/" + s.picturePath  + "/" + s.profile_picture_filename;
                });
            }
    }
}]);

vmaServices.factory('vmaGroupService', ['Restangular', '$q', '$filter', function(Restangular, $q, $filter) {
    var allGroups = localStorage.getObject("allGroups");
    var manGroups = localStorage.getObject("manGroups");
    var memGroups = localStorage.getObject("memGroups");
    var subGroups;
    var metaGroups;
    var promAllGroups;
    var updating;
    return {
        updateGroups:
            //ACCESSES SERVER AND UPDATES THE LIST OF GROUPS
            function(update) {
                if(update || ((!allGroups || !manGroups) && !updating)) {
                    updating = true;
                    var gPromByMan = Restangular.all("locations").one("byManager").getList();
                    gPromByMan.then(function(success) {
                        success = Restangular.stripRestangular(success);
                        localStorage.setObject("manGroups", success);
                        manGroups = success;
                    }, function(fail) {
            //            console.log(fail);
                    });
                    var gPromMaster = Restangular.all("locations").getList();
                    gPromMaster.then(function(success) {
                        success = Restangular.stripRestangular(success);
                        localStorage.setObject("allGroups", success);
                        allGroups = success;
                    }, function(fail) {
            //            console.log(fail);
                    });
                    promAllGroups = $q.all([gPromByMan, gPromMaster]).then(function() {updating = false;});
                    return promAllGroups;
                } else if (updating){
                    return promAllGroups;
                } else {
                    var defer = $q.defer();
                    defer.resolve("DONE");
                    return defer.promise;
                }
            },
        getAllGroups:
            function() {
                return this.updateGroups().then(function(success) { return allGroups; });
            },
        getManGroups:
            function() {
                return this.updateGroups().then(function(success) { return manGroups; });
            },
        getMemGroups:
            function() {
                return this.updateGroups().then(function(success) { return memGroups; });
            },
        getSubtractedGroups:
            function(update) {
                return this.updateGroups(update).then(function(success) {
                    var assignedGroupsIds = {};
                    var groupsIds = {};
                    var result = [];

                    var assignedGroups = manGroups;
                    var groups = allGroups;

                    assignedGroups.forEach(function (el, i) {
                        assignedGroupsIds[el.id] = assignedGroups[i];
                    });

                    groups.forEach(function (el, i) {
                        groupsIds[el.id] = groups[i];
                    });

                    for (var i in groupsIds) {
                        if (!assignedGroupsIds.hasOwnProperty(i)) {
                            result.push(groupsIds[i]);
                        }
                    }
                    subGroups = result;
                    return result;
                });
            },
        getMetaGroups:
            function(update) {
                return this.getSubtractedGroups(update).then(function(success) {
                    var result = [];
                    subGroups.forEach(function(obj){
                        obj.isGroup = true;
                        result.push(obj);
                    });
                    manGroups.forEach(function(obj){
                        obj.isManager = true;
                        result.push(obj);
                    });
                    metaGroups = result;
                    return result;
                });
            },
        getMetaJoinedGroups:
            function(update) {
                return this.getSubtractedGroups(update).then(function(success) {
                    var result = [];
                    manGroups.forEach(function(obj){
                        obj.isManager = true;
                        result.push(obj);
                    });
                    memGroups.forEach(function(obj){
                        obj.isMember = true;
                        result.push(obj);
                    });
                    metaGroups = result;
                    return result;
                });
            },
        getGroup:
            function(group_id) {
                return this.updateGroups().then(function(success) {
                    var group = $filter('getById')(allGroups, group_id);
                    return group;
                });
            },
        getGroupMeta:
            function(group_id, update) {
                return this.getMetaGroups(update).then(function(success) {
                    var group = $filter('getById')(success, group_id);
                    if($filter('getById')((manGroups), group_id)) {
                        group.joined = true;
                    } else {
                        group.joined = false;
                    }
                    return group;
                });
            },
        addGroup:
            function(group) {
                return Restangular.all("groups").post(group);
            },
        editGroup:
            function(id, group) {
                 return Restangular.all("groups").all(id).post(group);
            },
        deleteGroup:
            function(gid) {
                return Restangular.all("groups").all(gid).remove();
            },
        joinGroup:
            function(gid, uid) {
                return Restangular.all("groups").all(gid).all("MEMBER").all(uid).post();
            },
        isManager:
            function(gid) {
                return this.getManGroups().then(function(success) {
                    var group = $filter('getById')(manGroups, gid);
                    if(group) return true; else return false;
                }, function(fail) {
                    //asdf
                });
            },
        leaveGroupManager:
            function(gid, uid) {
                 return Restangular.all("locations").all(gid).all("MANAGER").all(uid).remove().then(function(success) {});
            },
        leaveGroupMember:
            function(gid, uid) {
                return this.leaveGroupManager(gid, uid).then(function(success) {
                    return Restangular.all("groups").all(gid).all("MEMBER").all(uid).remove().then(function(success) {});
                });
            }
    }
}]);

vmaServices.factory('vmaTaskService', ['Restangular', '$q', '$filter', 'vmaGroupService', function(Restangular, $q, $filter, vmaGroupService) {
    var allTasks;
    var subTasks = [];
    var metaTasks = [];
    var memTasks = [];
    var updating;
    var promAllTasks;
    return {
        updateTasks:
            //ACCESSES SERVER AND UPDATES THE LIST OF TASKS
            function(refresh) {
                if(refresh || ((!allTasks || !memTasks) && !updating)) {
                    updating = true;
                    console.log("TASKS UPDATED");

                    var gPromMaster = Restangular.all("classes").getList();
                    gPromMaster.then(function(success) {
                        success = Restangular.stripRestangular(success);
                        allTasks = success;
                        //console.log(success);
                        return allTasks;
                    }, function(fail) {
            //            console.log(fail);
                    });

                    var gProm = Restangular.all("classes").one("byMembership").getList();

                    gProm.then(function(success) {
                        success = Restangular.stripRestangular(success);
                        memTasks = success;
                    }, function(fail) {
                        //            console.log(fail);
                    });

                    promAllTasks = $q.all([gProm, gPromMaster]).then(function() {updating = false;});
                    return promAllTasks;
                } else if (updating){
                    return promAllTasks;
                } else {
                    var defer = $q.defer();
                    defer.resolve(allTasks);
                    return defer.promise;
                }
            },
        getMetaTasks:
            function(update) {
                return this.getSubtractedTasks(update).then(function(success) {
                    var result = [];
                    memTasks.forEach(function(obj){
                        obj.isMember = true;
                        result.push(obj);
                    });
                    subTasks.forEach(function(obj){
                        obj.isTask = true;
                        result.push(obj);
                    });
                    metaTasks = result;
                    return result;
                });
            },
        getAllTasksGroup:
            function(gid, update) {
                return this.updateTasks(update).then(function() {
                    var tasks = $filter('getTasksByGroupId')(allTasks, gid);
                    return tasks;
                });
            },
        getSubtractedTasks:
            function(update) {
                return this.updateTasks(update).then(function(success) {
                    var assignedGroupsIds = {};
                    var groupsIds = {};
                    var result = [];

                    var assignedGroups = memTasks;
                    var groups = allTasks;

                    assignedGroups.forEach(function (el, i) {
                        assignedGroupsIds[el.id] = assignedGroups[i];
                    });

                    groups.forEach(function (el, i) {
                        groupsIds[el.id] = groups[i];
                    });

                    for (var i in groupsIds) {
                        if (!assignedGroupsIds.hasOwnProperty(i)) {
                            result.push(groupsIds[i]);
                        }
                    }
                    subTasks = result;
                    return result;
                });
            },
        getMetaTasksGroup:
            function(gid, update) {
                return this.getMetaTasks(update).then(function(success) {
                    var manGroups = [];
                    return vmaGroupService.isManager(gid).then(function(isMan) {
                        var result = $filter('getTasksByGroupId')(success, gid);
                        //FORMATTING DATE/TIME
                        result.forEach(function(obj) {
                            if(obj.time) {
                                obj.datetime = new Date(obj.time).toDateString() + " " + new Date(obj.time).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                            } else {
                                obj.time = "No Time Specified";
                            }
                        });
                        if(!isMan) {
                            return result;
                        } else {
                            result.forEach(function(obj) {
                                // SETTING PERMISSIONS METADATA
//                                obj.isMember = false;
//                                obj.isManager = false;
//                                obj.isTask = false;
                                obj.isGroupManager = true;
                            });
                            return result;
                        }
                    }, function(error) {
                        //console.log(error);
                    });
                });
            },
        getJoinTasks:
            function(update) {
                return Restangular.all("classes").all("byMembership").getList().then(function(s) {
                    s.forEach(function(s2) {
                        s2.isMember = true;
                    })
                    return s;
                });
            },
        getCalTasks:
            function() {
                return this.getJoinTasks().then(function(success) {
                    //console.log(success);
                    var result = [];
                    success.forEach(function(entry) {
//                        console.log(new Date(entry.time));
                        if(entry.time) {
                            var localoffset = (new Date(entry.time)).getTimezoneOffset();
                            // "unadjust" date
                            entry.datetime = new Date(entry.time).toDateString() + " " + new Date(entry.time).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                            entry.time = new Date(entry.time.valueOf()/* - (localoffset * 60 * 1000)*/);
                            var URL = "/#/task" + JSON.stringify(entry);
                            URL = encodeURI(URL);
                            result.push({"title" : entry.name, "start": entry.time, "url": URL});
                        }
                    });
                    return result;
                });
            },
        getTask:
            function(task_id, update) {
                return this.updateTasks(update).then(function(success) {
                    var task = $filter('getById')(allTasks, task_id);
                    return task;
                });
            },
        getTaskPure:
            function(task_id, update) {
                return Restangular.all("classes").get(task_id);
            },
        getTaskByName:
            function(task_name, update) {
                return this.updateTasks(update).then(function(success) {
                    var task = $filter('getByName')(allTasks, task_name);
                    return task;
                });
            },
        getTaskView:
            function(task_id, update) {
                return this.updateTasks(update).then(function(success) {
                    var task = $filter('getById')(success, task_id);
                    if(task.time) {
                        task.time = new Date(task.time).toDateString() + " " + new Date(task.time).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                    } else {
                        task.time = "No Time Specified";
                    }
                    return task;
                });
            },
        addTask:
            function(task) {
                return Restangular.all("classes").post(task);
            },
        editTask:
            function(id, task) {
                 return Restangular.all("classes").all(id).doPUT(task);
            },
        deleteTask:
            function(tid) {
                return Restangular.all("classes").all(tid).remove();
            },
        joinTask:
            function(tid, uid) {
                return Restangular.all("classes").all(tid).all("MEMBER").all(uid).post();
            },
        leaveTaskManager:
            function(tid, uid) {
                 return Restangular.all("classes").all(tid).all("MEMBER").all(uid).remove().then(function(success) {});
            },
        leaveTaskMember:
            function(tid, uid) {
                return this.leaveTaskManager(tid, uid).then(function(success) {
                    return Restangular.all("classes").all(tid).all("MEMBER").all(uid).remove().then(function(success) {});
                });
            },
        markFinished:
            function(tid) {
                return Restangular.all("classes").all(tid).post({"finished":1})
            },
        markUnFinished:
            function(tid) {
                return Restangular.all("classes").all(tid).post({"finished":0})
            }
    }
}]);

vmaServices.factory('vmaPostService', ['Restangular', '$q', 'vmaGroupService', 'vmaUserService', 'vmaCommentService', function(Restangular, $q, vmaGroupService, vmaUserService, vmaCommentService) {
    var allPosts = [];
    var myGroupPosts = [];
    var metaPosts = [];
    return {
        //NOT USED OUTSIDE OF SERVICE
        updatePosts:
            function() {
                if(refresh) {
                    console.log("POSTS UPDATED");
                    var gPromAll = Restangular.all("posts").getList();
                    gPromAll.then(function(success) {
                        success = Restangular.stripRestangular(success);
                        allPosts = success;
                    }, function(fail) {
            //            console.log(fail);
                    });
                    var gPromByMe = Restangular.all("posts").one("myPosts").getList();
                    gPromByMe.then(function(success) {
                        success = Restangular.stripRestangular(success);
                        myGroupPosts = success;
                    }, function(fail) {
            //            console.log(fail);
                    });
                    return $q.all([gPromAll, gPromByMe]);
                }
                else {
                    var deferred = $q.defer();
                    deferred.resolve("DONE");
                    return deferred.promise;
                }
            },
        getAllPosts:
            function() {
                return this.updatePosts().then(function(success) {
                    var resultPosts = [];
                    allPosts.forEach(function(post) {
                        post.date =  new Date(post.creation_timestamp).toDateString() + " " + new Date(post.creation_timestamp).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                        vmaGroupService.getGroup(post.group_id).then(function(success) { post.group = success });
                        vmaUserService.getUser(post.user_id).then(function(success) { post.user = success });
                        resultPosts.push(post);
                    });
                    return resultPosts;
                });
            },
        getMyGroupPosts:
            function(numPosts, startindex) {
                return Restangular.all("posts").all("myPosts").getList({"numberOfPosts": numPosts, "startIndex": startindex}).
                then(function(success) {
                    var resultPosts = [];
                    success.forEach(function(post) {
                        post.time = new Date(post.creation_timestamp).toDateString() + " " + new Date(post.creation_timestamp).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                        vmaGroupService.getGroup(post.group_id).then(function(success) { post.group = success });
                        vmaUserService.getUser(post.user_id).then(function(success) { post.user = success });
//                        console.log(post);
                        resultPosts.push(post);
                    });
                    return resultPosts;
                }, function(fail) {
        //            console.log(fail);
                });
            },
        getGroupPostsPromise:
            function(numPosts, startindex, gid) {
                var gPromAll = Restangular.all("posts").getList({"numberOfPosts": numPosts, "startIndex": startindex, "group_id": gid});
                return gPromAll.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    var resultPosts = [];
                    success.forEach(function(post) {
                        post.time =  new Date(post.creation_timestamp).toDateString() + " " + new Date(post.creation_timestamp).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                        vmaGroupService.getGroup(post.group_id).then(function(success) { post.group = success });
                        vmaUserService.getUser(post.user_id).then(function(success) { post.user = success });
                        resultPosts.push(post);
                    });
                    return resultPosts;
                }, function(fail) {
        //            console.log(fail);
                });
            },
        getGroupPosts:
            function(num, ind, gid) {
                return this.getGroupPostsPromise(num, ind, gid).then(function(success) {
                    return success;
                });
            },
        getPostView:
            function(count, start, post_id) {
                return  Restangular.all("posts").get(post_id).then(function(success) {
                    var post = success;
                    post.date =  new Date(post.creation_timestamp).toDateString() + " " + new Date(post.creation_timestamp).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                    vmaGroupService.getGroup(post.group_id).then(function(success) { post.group = success });
                    vmaUserService.getUser(post.user_id).then(function(success) { post.user = success });
                    vmaCommentService.getPostComments(count, start, post.id).then(function(success) { post.comments =success; });
                    return post;
                });
            },
        getPost:
            function(post_id) {
                return Restangular.all("posts").get(post_id);
            },
        addPost:
            function(post, uid) {
                post.user_id = uid;
                return Restangular.all("posts").post(post);
            },
        editPost:
            function(id, post) {
                 return Restangular.all("posts").all(id).post(post);
            },
        deletePost:
            function(pid) {
                return Restangular.all("posts").all(pid).remove();
            }
    }
}]);

vmaServices.factory('vmaCommentService', ['Restangular', '$q', 'vmaUserService', function(Restangular, $q, vmaUserService) {
    return {
        getPostCommentsPromise:
            function(numComments, startindex, pid) {
                var promAll = Restangular.all("comments").getList({"numberOfComments": numComments, "startIndex": startindex, "post_id": pid});
                return promAll.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    var resultComments = [];
                    success.forEach(function(comment) {
                        comment.time =   new Date(comment.creation_timestamp).toDateString() + " " + new Date(comment.creation_timestamp).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                        vmaUserService.getUser(comment.user_id).then(function(success) { comment.user = success;});
                        comment.img = "img/temp_icon.png";
//                        console.log(comment);
                        resultComments.push(comment);
                    });
                    return resultComments;
                }, function(fail) {

                });
             },
        getPostComments:
            function(num, ind, pid) {
                return this.getPostCommentsPromise(num, ind, pid).then(function(success) {
                    return success;
                });
            },
        getComment:
            function(comment_id) {
                return Restangular.all("comments").get(comment_id);
            },
        addComment:
            function(content, pid, uid) {
                var cmt = {"content" : content, "user_id": uid, "post_id": pid};
                //console.log(cmt);
                return Restangular.all("comments").post(cmt);
            },
        editComment:
            function(id, comment) {
                 return Restangular.all("comments").all(id).post(comment);
            },
        deleteComment:
            function(cid) {
                return Restangular.all("comments").all(cid).remove();
            }
    }
}]);

vmaServices.factory('vmaMessageService', ['Restangular', '$q', 'vmaTaskService', 'vmaUserService', function(Restangular, $q, vmaTaskService, vmaUserService) {
    return {
        getTaskMessagesPromise:
            function(numMessages, startindex, tid) {
                var promAll = Restangular.all("messages").getList({"numberOfMessages": numMessages, "startIndex": startindex, "task_id": tid});
                return promAll.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    var resultMessages = [];
                    success.forEach(function(message) {
                        message.time =  new Date(message.time).toDateString() + " " + new Date(message.time).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                        vmaUserService.getUser(message.sender_id).then(function(success) { message.user = success; message.username = success.username; });
                        message.img = "img/avatar.icon.png";
                        resultMessages.push(message);
                    });
                    return resultMessages;
                });
            },
        getTaskMessages:
            function(num, ind, tid) {
                return this.getTaskMessagesPromise(num, ind, tid).then(function(success) {
                    var localMsgObj;
                    if(success.length > 0) {
                        localMsgObj = localStorage.getObject("Task" + tid);
                        if(localMsgObj == null){
                            localMsgObj = success;
                        } else {
                            localMsgObj = localMsgObj.concat(success);
                        }
                        localStorage.setObject("Task" + tid, localMsgObj);
                    }
                    return localMsgObj;
                });
            },
        getTaskMessagesFromLocalStorage:
            function(tid){
                var success = localStorage.getObject("Task" + tid);
                var resultMessages = [];
                if(success) {
                    success.forEach(function(message) {
                        message.time =  new Date(message.time).toDateString() + " " + new Date(message.time).toLocaleTimeString().replace(/:\d{2}\s/,' ');
                        vmaUserService.getUser(message.sender_id).then(function(success) { message.user = success; message.username = success.username; });
                        message.img = "img/avatar.icon.png";
                        resultMessages.push(message);
                    });
                    return resultMessages;
                } else
                    return null;
            },
        addMessage:
            function(message, uid, tid) {
                if(message.message != ""){
                    var msg = {"content" : message.message, "sender_id": uid, "task_id": tid};
                    return Restangular.all("messages").post(msg);
                }
            },
        editMessage:
            function(id, message) {
                 return Restangular.all("messages").all(id).post(message);
            },
        deleteMessage:
            function(mid) {
                return Restangular.all("messages").all(mid).remove();
            }
    }
}]);

vmaServices.factory('vmaHourService', ['Restangular', 'vmaTaskService', 'vmaUserService','$q', function(Restangular, vmaTasksService, vmaUserService, $q) {
    return {
        getMyHours:
            function(numHours, startindex, gid, pending) {
                return Restangular.all("hours").all("myHours").getList({"numberOfHours": numHours, "startIndex": startindex, "group_id": gid, "onlyPending": pending});
            },
        getMyHoursWithTasks:
            function(numHours, startindex, gid, pending) {
                return Restangular.all("hours").all("myHours").getList({"numberOfHours": numHours, "startIndex": startindex, "group_id": gid, "onlyPending": pending}).then(function(success) {
                    var badgesObj = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0};
                    var promiseArray = [];
                    success.forEach(function(hour) {
                        var id = hour.task_id;
//                        console.log(id);
                        if (hour.approved) {
                            if (id != undefined)
                                promiseArray.push(vmaTasksService.getTask(id).then(function (success) {
                                    if (success != undefined) {
                                        if (success.badge_id === undefined) success.badge_id = 4;
                                        badgesObj[success.badge_id]++;
                                    }
                                }));
                            else {
                                badgesObj[4]++;
                            }
                        }
                    });
                    var deferred = $q.all(promiseArray);
                    return deferred.then(function(success){
                        return badgesObj;
                    });
                });
            },
        getHours:
            function(numHours, startindex, gid, pending) {
                return Restangular.all("hours").getList({"numberOfHours": numHours, "startIndex": startindex, "group_id": gid, "onlyPending": pending}).then(function(success) {
                    success = Restangular.stripRestangular(success);
                    success.forEach(function(hour) {
                        vmaUserService.getUser(hour.user_id).then(function(success){
                            hour.user = success;
                        });
                    });
                    return success;
                });
            },
        addHours:
            function(hour) {
                return Restangular.all("hours").post(hour);
            },
        getHour:
            function(h_id){
                return Restangular.all("hours").get(h_id);
            },
        editHours:
            function(id, hour) {
                return Restangular.all("hours").all(id).post(hour);
            },
        deleteHour:
            function(id) {
                return Restangular.all("hours").all(id).remove();
            },
        approveHour:
            function(id) {
                return Restangular.all("hours").all("approve").all(id).post(null, {"isApproved": true});
                //return this.getHour(id).then(function(s) {
                //    s.approved = true;
                //    s.pending = false;
                //    s.save();
                //});
            },
        denyHour:
            function(id) {
                return Restangular.all("hours").all("approve").all(id).post(null, {"isApproved" : false});
                //return this.getHour(id).then(function(s) {
                //    s.approved = false;
                //    s.pending = false;
                //    s.save();
                //});
            }
    }
}]);
