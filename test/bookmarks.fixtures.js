 function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'test1',
      url: 'https://www.test1.com',
      description: 'test1',
      rating: 1
    },
    {
      id: 2,
      title: 'test2',
      url: 'https://www.test2.com',
      description: 'test2',
      rating: 2
    },
    {
      id: 3,
      title: 'test3',
      url: 'https://www.test3.com',
      description: 'test3',
      rating: 3
    },
    {
      id: 4,
      title: 'test4',
      url: 'https://www.test4.com',
      description: 'test4',
      rating: 4
    },
  ];
}

module.exports = {
  makeBookmarksArray,
}