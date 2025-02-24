import {
  BrowserInfo,
  el,
  msg,
  Tabs,
  View,
  ViewParams,
} from "@common-module/app";
import { FollowingPostList, GlobalPostList } from "@common-module/social";
import KrewPost from "../database-interface/KrewPost.js";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import AddPopup from "../layout/AddPopup.js";
import Layout from "../layout/Layout.js";
import MaterialIcon from "../MaterialIcon.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KeyHeldPostList from "./KeyHeldPostList.js";
import KrewPostInteractions from "./KrewPostInteractions.js";
import KrewPostService from "./KrewPostService.js";
import NewPostForm from "./NewPostForm.js";
import PostPopup from "./PostPopup.js";

export default class PostsView extends View {
  private tabs: Tabs | undefined;
  private globalPostList: GlobalPostList<KrewPost>;
  private followingPostList: FollowingPostList<KrewPost> | undefined;
  private keyHeldPostList: KeyHeldPostList | undefined;

  constructor(params: ViewParams) {
    super();

    Layout.append(
      this.container = el(
        ".posts-view",
        el(
          "main",
          KrewSignedUserManager.signed ? new NewPostForm() : undefined,
          el(
            ".post-container",
            KrewSignedUserManager.signed
              ? this.tabs = new Tabs(
                "posts-view-tabs",
                KrewSignedUserManager.walletLinked
                  ? [
                    { id: "global", label: msg("posts-view-global-tab") },
                    { id: "following", label: msg("posts-view-following-tab") },
                    { id: "key-held", label: msg("posts-view-key-held-tab") },
                  ]
                  : [
                    { id: "global", label: msg("posts-view-global-tab") },
                    { id: "following", label: msg("posts-view-following-tab") },
                  ],
              )
              : undefined,
            this.globalPostList = new GlobalPostList<KrewPost>(
              KrewPostService,
              {
                signedUserId: KrewSignedUserManager.user?.user_id,
                wait: true,
              },
              KrewPostInteractions,
              new KrewLoadingAnimation(),
            ),
            KrewSignedUserManager.signed
              ? this.followingPostList = new FollowingPostList(
                KrewPostService,
                {
                  signedUserId: KrewSignedUserManager.user?.user_id!,
                  wait: true,
                },
                KrewPostInteractions,
                new KrewLoadingAnimation(),
              )
              : undefined,
            KrewSignedUserManager.walletLinked
              ? this.keyHeldPostList = new KeyHeldPostList()
              : undefined,
          ),
        ),
        KrewSignedUserManager.signed
          ? el("button.post", new MaterialIcon("add"), {
            click: () =>
              BrowserInfo.isPhoneSize ? new AddPopup() : new PostPopup(),
          })
          : undefined,
      ),
    );

    if (!this.tabs) {
      this.globalPostList.show();
    } else {
      this.tabs.on("select", (id: string) => {
        [this.globalPostList, this.followingPostList, this.keyHeldPostList]
          .forEach((list) => list?.hide());
        if (id === "global") this.globalPostList.show();
        else if (id === "following") this.followingPostList?.show();
        else if (id === "key-held") this.keyHeldPostList?.show();
      }).init();
    }
  }
}
