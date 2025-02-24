import { DomNode, el, ListLoadingBar, Store } from "@common-module/app";
import Krew from "../database-interface/Krew.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewService from "./KrewService.js";
import KrewUtil from "./KrewUtil.js";

export default class KrewSelector extends DomNode {
  private store: Store;
  private select: DomNode<HTMLSelectElement>;
  private refreshed = false;
  private lastCreatedAt: string | undefined;

  constructor() {
    super(".krew-selector");
    this.addAllowedEvents("change");
    this.append(
      this.select = el(
        "select",
        { change: (event, select) => this.fireEvent("change", this.krew) },
      ),
    );

    this.store = new Store("key-held-krews");
    const cached = this.store.get<Krew[]>("cached-krews");
    if (cached) {
      for (const krew of cached) {
        this.select.append(
          el("option", KrewUtil.getName(krew), { value: krew.id }),
        );
      }
    }
  }

  private async refresh() {
    if (KrewSignedUserManager.user?.wallet_address) {
      this.select.append(new ListLoadingBar());

      const krews = await KrewService.fetchKeyHeldKrews(
        KrewSignedUserManager.user.wallet_address,
        this.lastCreatedAt,
      );
      this.store.set("cached-krews", krews, true);

      if (!this.deleted) {
        this.select.empty();
        for (const krew of krews) {
          this.select.append(
            el("option", KrewUtil.getName(krew), { value: krew.id }),
          );
        }
        this.lastCreatedAt = krews[krews.length - 1]?.created_at;
      }
    }
  }

  public get krew() {
    return this.select.domElement.value;
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.refreshed) this.refresh();
    return this;
  }

  public hide() {
    this.addClass("hidden");
    return this;
  }
}
