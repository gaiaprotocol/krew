import { msg } from "@common-module/app";
import { PostList } from "@common-module/social";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import KrewPost from "../database-interface/KrewPost.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewPostInteractions from "./KrewPostInteractions.js";
import KrewPostService from "./KrewPostService.js";

export default class KeyHeldPostList extends PostList<KrewPost> {
  constructor() {
    super(
      ".key-held-post-list",
      KrewPostService,
      {
        storeName: "key-held-posts",
        signedUserId: KrewSignedUserManager.user?.user_id,
        emptyMessage: msg("key-held-post-list-empty-message"),
      },
      KrewPostInteractions,
      new KrewLoadingAnimation(),
    );
  }

  protected async fetchPosts(): Promise<
    {
      fetchedPosts: { posts: KrewPost[]; mainPostId: number }[];
      repostedPostIds: number[];
      likedPostIds: number[];
    }
  > {
    if (KrewSignedUserManager.user?.wallet_address) {
      const result = await KrewPostService.fetchKeyHeldPosts(
        KrewSignedUserManager.user.user_id,
        KrewSignedUserManager.user.wallet_address,
        this.lastPostId,
      );
      return {
        fetchedPosts: result.posts.map((p) => ({
          posts: [p],
          mainPostId: p.id,
        })),
        repostedPostIds: result.repostedPostIds,
        likedPostIds: result.likedPostIds,
      };
    } else {
      return {
        fetchedPosts: [],
        repostedPostIds: [],
        likedPostIds: [],
      };
    }
  }
}
