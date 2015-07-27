describe("Filter Test -> filters.js -> ", function () {
        
    // list of task objects to test with
    var tasks = 
    [
	{
        name: "Monday",
        id: 4,
        joined: true,
        location_id: 23
	},
	{
        name: "Hello",
        id: 9,
        joined: false,
        location_id: 4
	},
	{
		name: "Dates",
        id: 7,
        joined: true,
        location_id: 23
	},
	{
		name: "Wednesday",
        id: 23,
        joined: false,
        location_id: 12
    },
        
	{
		name: "HelloNow",
        id: 7,
        joined: true,
        location_id: 43
    }
];

    var filterInstance;

    beforeEach(angular.mock.module("vmaFilterModule"));

    
    
    
    
    
    
// getsById
    beforeEach(angular.mock.inject(function ($filter) {
        getsById = $filter("getById");
    }));

    it("gets first post by id when given a correct id", function () {
   expect(getsById(tasks, 7)).toBe(tasks[2]);
    });
    
    
    it("returns null when post id is not found", function () {
   expect(getsById(tasks, 99)).toBe(null);
    });
 
    
    
    
    
    
    
// getByName
    beforeEach(angular.mock.inject(function ($filter) {
        getByName = $filter("getByName");
    }));

      it("gets first post by name when given correct name", function () {
   expect(getByName(tasks, "Hello")).toBe(tasks[1]);
    });
  
      it("returns null when wrong post name is entered", function () {
   expect(getByName(tasks, "James")).toBe(null);
    
      });
  
    
    
    
    
    
// getTasksByGroupId
    beforeEach(angular.mock.inject(function ($filter) {
        getTasksByGroupId = $filter("getTasksByGroupId");
    }));

    // var created to test after group_id = 23 is passed.
    var afterTasksAreGroupedUp = 
    [
	{
        name: "Monday",
        id: 4,
        joined: true,
        location_id: 23
	},{
		name: "Dates",
        id: 7,
        joined: true,
        location_id: 23
	}
];
    var empty= [];

     it("returns null when Location Id doesn't exist", function () {
 expect(getTasksByGroupId(tasks, 239)).toEqual(empty);
    });
  
     it("returns all tasks related to the location id given", function () {
 expect(getTasksByGroupId(tasks, 23)).toEqual(afterTasksAreGroupedUp);
    });
    
     it("returns all tasks related to location id given even though only one such post exists", function () {
 expect(getTasksByGroupId(tasks, 43)).toEqual([tasks[4]]);
    });  
    
    
    
    
    // changed location_id to group_id
      var tasksWithGroupId = 
    [
	{
        name: "Monday",
        id: 4,
        joined: true,
        group_id: 23
	},
	{
        name: "Hello",
        id: 9,
        joined: false,
        group_id: 4
	},
	{
		name: "Dates",
        id: 7,
        joined: true,
        group_id: 23
	},
	{
		name: "Wednesday",
        id: 23,
        joined: false,
        group_id: 12
    },
        
	{
		name: "Hello",
        id: 7,
        joined: true,
        group_id: 43
    }
];
    
      // after tasks are grouped up by group id.
  
     var afterTasksAreGroupedUpByLocationID = 
    [
	{
        name: "Monday",
        id: 4,
        joined: true,
        group_id: 23
	},{
		name: "Dates",
        id: 7,
        joined: true,
        group_id: 23
	}
];

    
// getByGroupId
    beforeEach(angular.mock.inject(function ($filter) {
        getByGroupId = $filter("getByGroupId");
    }));
    
    
     it("returns one post with given location because it meets specification", function () {
 expect(getByGroupId(tasksWithGroupId, 12)).toEqual([tasksWithGroupId[3]]);
    });
    
      it("returns null when group id is not found", function () {
 expect(getByGroupId(tasks, 13)).toEqual(empty);
    });
  
     it("gets multiple posts when given correct location_id", function () {
 expect(getByGroupId(tasksWithGroupId, 23)).toEqual(afterTasksAreGroupedUpByLocationID);
    });
    
    
    
    
 
// removeJoined
    beforeEach(angular.mock.inject(function ($filter) {
        removeJoined = $filter("removeJoined");
    }));

 // var created to test after joined = true is passed.
     var afterTasksAreGrouped = 
    [
	{
        name: "Monday",
        id: 4,
        joined: true,
        location_id: 23
	},
	{
		name: "Dates",
        id: 7,
        joined: true,
        location_id: 23
	},
	{
		name: "fds",
        id: 7,
        joined: false,
        location_id: 43
    }
];
    
    
    var groupsNotJoined =
        [
        {
        name: "Hello",
        id: 9,
        joined: false,
        location_id: 4
	},
	{
		name: "Wednesday",
        id: 23,
        joined: false,
        location_id: 12
    }];
    it("returns all groups where joined = true ", function () {
     // removeJoined(tasks, X) ----- can be any 'X' because it is not being used in the actual function
  expect(removeJoined(tasks, 23)).toEqual(groupsNotJoined);
         });
    
    
    
    
    
    
    
    
    
    
    
    
// convertToIndex
    beforeEach(angular.mock.inject(function ($filter) {
        convertToIndex = $filter("convertToIndex");
    }));
    
    var id =["dummy content"];
    var taskNull = ["content"];
    var idCorrect = ["Wednesday","Dates", "Monday"];
 
     it("return null when input is null", function () {
expect(convertToIndex(tasks, id)).toEqual([]);
     });
    
    it("return null when id is null", function () {
expect(convertToIndex(taskNull, idCorrect)).toEqual([]);
     });
    
   
      it("returns index of id in tasks", function () {
 expect(convertToIndex(tasks, idCorrect)).toEqual([2,1,0]);
    });
  
    
  /*  
// convertToIndex
    beforeEach(angular.mock.inject(function ($filter) {
        selectCores = $filter("selectCores");
    }));
    
    var id =["dummy content"];
    var taskNull = ["content"];
    var idCorrect = ["Wednesday","Dates", "Monday"];
 
     it("return null when input is null", function () {
expect(selectCores(classes, output)).toEqual([]);
     });
    
    it("return null when id is null", function () {
expect(selectCores(classes, output)).toEqual([]);
     });
    
   
      it("returns index of id in tasks", function () {
 expect(selectCores(classes, output)).toEqual([2,1,0]);
    });
  */
    
});