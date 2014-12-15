var setEach = function (collection, insert, update, remove) {
  collection.allow({ insert: insert, update: update, remove: remove });
  collection.deny({ insert: !insert, update: !update, remove: !remove });
};

var setAll = function (collection, permission) {
  setEach(collection, permission, permission, permission);
};

var isOwner = function (userId, collection) {
  return collection.owner == userId;
};

var isUserOrOwner = function (userId, collection) {
  if (collection.user == userId) {
    return true;
  } else {
    var santa = Santa.findOne({_id: collection.santa});
    return santa.owner == userId; 
  } 
};

setAll(Santa, isOwner);
setAll(Request, isUserOrOwner);
setAll(Membership,isUserOrOwner);

