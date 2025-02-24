import { DomNode, el } from "@common-module/app";
import KrewPost, { PostTarget } from "../database-interface/KrewPost.js";
import KrewSelector from "../krew/KrewSelector.js";
import KrewPostForm from "./KrewPostForm.js";
import PostTargetSelector from "./PostTargetSelector.js";

export default class NewPostForm extends DomNode {
  private targetSelector: PostTargetSelector;
  private krewSelector: KrewSelector;
  private form: KrewPostForm;

  constructor(focus?: boolean, callback?: (post: KrewPost) => void) {
    super(".new-post-form");

    this.append(
      el(
        "header",
        this.targetSelector = new PostTargetSelector(),
        this.krewSelector = new KrewSelector().hide(),
      ),
      this.form = new KrewPostForm(
        undefined,
        focus,
        callback ? (post) => callback(post) : undefined,
      ),
    );

    this.targetSelector.on(
      "change",
      (target: number) => {
        this.form.target = target;
        if (target === PostTarget.KEY_HOLDERS) {
          this.krewSelector.show();
          this.form.krew = this.krewSelector.krew;
        } else this.form.krew = undefined;
      },
    );

    this.krewSelector.on(
      "change",
      (krew: string) => this.form.krew = krew,
    );
  }

  public show() {
    this.deleteClass("hidden");
    return this;
  }

  public hide() {
    this.addClass("hidden");
    return this;
  }
}
