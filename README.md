# Gist Shameful

App showing Firebase Auth and Firebase Realtime DB to create a secure way to store your shameful Gists.

## Example Data

```js
{
  gists: {
    gist1: {
      code: "[1,2,3].map(num => num * num)",
      file: "map.js",
      uid: "user1",
    },
    gist2: {
      code: "[1,2,3].map { |num| num * num }",
      file: "map.rb",
      uid: "user1",
    },
  },
  userGists: {
    user1: {
      gist1: true,
      gist2: true,
    },
  },
}
```

## Rules

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "gists": {
      "$gid": {
        ".read": "auth.uid === data.child('uid').val()",
        ".write": "
        	(!data.exists() && auth.uid === newData.child('uid').val()) ||
          (data.exists() && auth.uid === data.child('uid').val())
        "
      }
    },
    "userGists": {
			"$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```
