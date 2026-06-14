export class Post {
    id?: string;
    title: string;
    content: string;
    authorId: string;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(post: Post) {
        this.title = post.title;
        this.content = post.content;
        this.authorId = post.authorId;
    }
}
