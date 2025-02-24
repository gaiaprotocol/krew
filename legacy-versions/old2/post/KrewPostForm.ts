import { msg, Router, Snackbar } from "@common-module/app";
import { PostForm } from "@common-module/social";
import KrewPost, { PostTarget } from "../database-interface/KrewPost.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewPostService from "./KrewPostService.js";

export default class KrewPostForm extends PostForm {
  public target: number = PostTarget.EVERYONE;
  public krew: string | undefined;

  constructor(
    private parentPostId?: number,
    focus?: boolean,
    private callback?: (post: KrewPost) => void,
  ) {
    super([
      KrewSignedUserManager.user?.avatar_thumb,
      KrewSignedUserManager.user?.stored_avatar_thumb,
    ], focus);
  }

  protected async post(message: string, files: File[]): Promise<void> {
    const post = !this.parentPostId
      ? await KrewPostService.post(this.target, this.krew, message, files)
      : await KrewPostService.comment(this.parentPostId, message, files);

    new Snackbar({
      message: msg("post-form-posted-snackbar-message"),
      action: {
        title: msg("post-form-posted-snackbar-button"),
        click: () => Router.go(`/post/${post.id}`, undefined, post),
      },
    });

    if (this.callback) this.callback(post);
  }
}
