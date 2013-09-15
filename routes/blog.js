var posts = [
  {  title: 'First Post!',
     date: 'Sat Sep 14 2013',
     content: 'First post in the bag!'
  },
  {  title: 'Second Post!',
     date: 'Sun Sep 15 2013',
     content: 'Second post in the bag!'
  },
  {  title: 'Third Post!',
     date: 'Sun Sep 15 2013',
     content: 'Third post in the bag!'
  }
];

exports.blog = function (req, res) {
  res.end(JSON.stringify(posts));
};