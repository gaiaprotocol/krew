import { el, Router } from "@common-module/app";
import ChatRoomListItem from "../chat/ChatRoomListItem.js";
import Krew from "../database-interface/Krew.js";
import KrewUtil from "../krew/KrewUtil.js";

export default class KrewChatRoomListItem extends ChatRoomListItem {
  constructor(krew: Krew) {
    super(".krew-chat-room-list-item", krew);
    this.append(
      el(".image", {
        style: {
          backgroundImage: `url(${krew.image})`,
        },
      }),
      el(
        ".info",
        el("h3", KrewUtil.getName(krew)),
        this.lastMessageDisplay,
      ),
    ).onDom(
      "click",
      () =>
        Router.go(
          `/${krew.id.substring(0, 1)}/${krew.id.substring(2)}`,
          undefined,
          krew,
        ),
    );
  }
}
