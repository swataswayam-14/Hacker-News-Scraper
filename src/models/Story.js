export class Story {
  constructor(data) {
    this.id = data.id;
    this.hackerNewsId = data.hackerNewsId;
    this.title = data.title;
    this.url = data.url;
    this.points = data.points;
    this.author = data.author;
    this.createdAt = data.createdAt;
    this.commentsCount = data.commentsCount;
    this.comments = data.comments;
  }

  static fromHackerNews(data) {
    return {
      hackerNewsId: data.hackerNewsId,
      title: data.title,
      url: data.url,
      points: data.points,
      author: data.author,
      commentsCount: data.commentsCount,
      comments: data.comments || []
    };
  }

  static toJSON(story) {
    return {
      id: story.id,
      hackerNewsId: story.hackerNewsId,
      title: story.title,
      url: story.url,
      points: story.points,
      author: story.author,
      createdAt: story.createdAt,
      commentsCount: story.commentsCount,
      comments: story.comments
    };
  }
}