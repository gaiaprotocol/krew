import {
  Button,
  Constants,
  DateUtil,
  DomNode,
  el,
  ListLoadingBar,
  msg,
  Router,
} from "@common-module/app";
import { FollowService, PreviewUserPublic } from "@common-module/social";
import { ethers } from "ethers";
import KrewUserPublic from "../../database-interface/KrewUserPublic.js";
import KrewService from "../../krew/KrewService.js";
import MaterialIcon from "../../MaterialIcon.js";
import WalletDataService from "../../wallet/WalletDataService.js";
import KrewSignedUserManager from "../KrewSignedUserManager.js";
import KrewUserService from "../KrewUserService.js";
import LoginRequiredPopup from "../LoginRequiredPopup.js";
import OwnedKrewListItem from "./OwnedKrewListItem.js";

export default class UserProfile extends DomNode {
  private feesEarnedFetched = false;
  private portfolioValueFetched = false;
  private krewsFetched = false;

  private userId: string | undefined;

  private infoContainer: DomNode;
  private followButton: Button | undefined;
  private krewList: DomNode;

  private feesEarnedDisplay: DomNode;
  private portfolioValueDisplay: DomNode;

  private holdingDisplay: DomNode;
  private followingDisplay: DomNode;
  private followersDisplay: DomNode;

  constructor(
    xUsername: string,
    previewUser: PreviewUserPublic | undefined,
    private feeClaimable = false,
  ) {
    super(".user-profile");

    this.append(
      this.infoContainer = el(".info-container"),
      el(
        ".krew-list-container",
        el("h2", msg("user-profile-owned-krews")),
        this.krewList = el(".krew-list", new ListLoadingBar()),
      ),
      el(
        ".metrics-container",
        el("h2", msg("user-profile-metrics-title")),
        el(
          "section.earned",
          el(".icon-container", new MaterialIcon("savings")),
          el(
            ".metric",
            el("h3", msg("user-profile-metrics-fees-earned-title")),
            this.feesEarnedDisplay = el(".value", "..."),
          ),
        ),
        el(
          "section.portfolio-value",
          el(".icon-container", new MaterialIcon("account_balance")),
          el(
            ".metric",
            el("h3", msg("user-profile-metrics-portfolio-value-title")),
            this.portfolioValueDisplay = el(".value", "..."),
          ),
        ),
      ),
      el(
        ".connections-container",
        el(
          "a.holding",
          this.holdingDisplay = el(".value", "..."),
          el("h3", msg("user-profile-connections-holding-keys-title")),
          { click: () => Router.go(`/${xUsername}/holding`) },
        ),
        el(
          "a.following",
          this.followingDisplay = el(".value", "..."),
          el("h3", msg("user-profile-connections-following-title")),
          { click: () => Router.go(`/${xUsername}/following`) },
        ),
        el(
          "a.followers",
          this.followersDisplay = el(".value", "..."),
          el("h3", msg("user-profile-connections-followers-title")),
          { click: () => Router.go(`/${xUsername}/followers`) },
        ),
      ),
    );

    if (previewUser) this.renderUser(previewUser);

    this.onDelegate(FollowService, ["follow", "unfollow"], (userId) => {
      if (this.followButton && userId === this.userId) {
        this.followButton.text = FollowService.isFollowing(userId)
          ? "Unfollow"
          : "Follow";
      }
    });
  }

  public set user(user: KrewUserPublic | undefined) {
    if (user) {
      this.userId = user.user_id;
      this.renderUser(user);

      this.followingDisplay.text = String(user.following_count);
      this.followersDisplay.text = String(user.follower_count);

      if (user.wallet_address) {
        this.fetchFeesEarned(user.wallet_address);
        this.fetchPortfolioValue(user.wallet_address);
        this.fetchKrews(user.wallet_address);
      } else {
        this.krewList.empty();
        this.feesEarnedDisplay.text = "0";
        this.holdingDisplay.text = "0";
        this.portfolioValueDisplay.text = "0";
      }
    }
  }

  private renderUser(user: PreviewUserPublic & { created_at?: string }) {
    this.infoContainer.empty().append(
      el(".profile-image", {
        style: {
          backgroundImage: `url(${user.avatar})`,
        },
      }),
      el(
        ".info",
        el("h2", user.display_name),
        el(
          "h3",
          el("a", `@${user.x_username}`, {
            href: `https://x.com/${user.x_username}`,
            target: "_blank",
          }),
        ),
        el(
          ".link",
          `https://krew.social/${user.x_username}`,
          el("button.copy", new MaterialIcon("content_copy"), {
            click: (event, button) => {
              navigator.clipboard.writeText(
                `https://krew.social/${user.x_username}`,
              );
              button.empty().append(new MaterialIcon("check"));
            },
          }),
        ),
        el(
          "p",
          msg("user-profile-joined", {
            date: DateUtil.format(
              user.created_at ?? Constants.NEGATIVE_INFINITY,
            ),
          }),
        ),
        el(
          "footer",
          this.followButton = new Button({
            title: FollowService.isFollowing(user.user_id)
              ? "Unfollow"
              : "Follow",
            click: () => {
              if (!KrewSignedUserManager.signed) {
                new LoginRequiredPopup();
              } else {
                FollowService.toggleFollow(user.user_id);
              }
            },
          }),
          el("a", "𝕏", {
            href: `https://twitter.com/${user.x_username}`,
            target: "_blank",
          }),
        ),
      ),
    );
  }

  private async fetchFeesEarned(walletAddress: string) {
    if (this.feesEarnedFetched) return;
    this.feesEarnedFetched = true;

    const walletData = await WalletDataService.fetch(walletAddress);
    this.feesEarnedDisplay.text = walletData
      ? ethers.utils.formatEther(
        walletData.total_earned_trading_fees,
      )
      : "0";
    this.holdingDisplay.text = walletData
      ? String(walletData.total_key_balance)
      : "0";
  }

  private async fetchPortfolioValue(walletAddress: string) {
    if (this.portfolioValueFetched) return;
    this.portfolioValueFetched = true;

    const value = await KrewUserService.fetchPortfolioValue(walletAddress);
    this.portfolioValueDisplay.text = ethers.utils.formatEther(value);
  }

  private async fetchKrews(walletAddress: string) {
    if (this.krewsFetched) return;
    this.krewsFetched = true;

    const krews = await KrewService.fetchOwnedKrews(walletAddress, undefined);
    this.krewList.empty();
    for (const krew of krews) {
      this.krewList.append(
        new OwnedKrewListItem(krew, this.feeClaimable),
      );
    }
  }
}
