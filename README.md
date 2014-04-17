drag-sort
---------

![screenshot](./screenshot.png)

```javascript
var dragsort = require('drag-sort');
var ul = document.querySelector('ul');

var ctrl = dragsort(ul, {
  item: '.item',
  handler: '.handler'
});

ctrl.on('change', function (items) {
  console.log(items);
});
```
