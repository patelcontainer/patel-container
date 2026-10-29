import type { StructureResolver } from "sanity/structure";
import { CogIcon } from "@sanity/icons/Cog";
import { PackageIcon } from "@sanity/icons/Package";
import { ComposeIcon } from "@sanity/icons/Compose";
import { InboxIcon } from "@sanity/icons/Inbox";
import { UsersIcon } from "@sanity/icons/Users";
import { ProjectsIcon } from "@sanity/icons/Projects";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("VAHANA")
    .items([
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
      S.divider(),
      S.documentTypeListItem("page").title("Pages"),
      S.listItem()
        .title("Products")
        .icon(PackageIcon)
        .child(
          S.list()
            .title("Products")
            .items([
              S.documentTypeListItem("product").title("All products"),
              S.documentTypeListItem("productCategory").title("Categories"),
              S.listItem()
                .title("Products by category")
                .child(
                  S.documentTypeList("productCategory")
                    .title("Pick a category")
                    .child((categoryId) =>
                      S.documentList()
                        .title("Products")
                        .schemaType("product")
                        .filter('_type == "product" && category._ref == $categoryId')
                        .params({ categoryId }),
                    ),
                ),
            ]),
        ),
      S.documentTypeListItem("industry").title("Industries"),
      S.listItem()
        .title("Projects & gallery")
        .icon(ProjectsIcon)
        .child(
          S.list()
            .title("Projects & gallery")
            .items([
              S.documentTypeListItem("project").title("Projects & case studies"),
              S.documentTypeListItem("galleryAlbum").title("Gallery albums"),
              S.documentTypeListItem("client").title("Clients"),
            ]),
        ),
      S.listItem()
        .title("Media")
        .icon(ComposeIcon)
        .child(
          S.list()
            .title("Media")
            .items([
              S.listItem()
                .title("News")
                .child(S.documentList().title("News").schemaType("post").filter('_type == "post" && postType == "news"').initialValueTemplates([])),
              S.listItem()
                .title("Blog")
                .child(S.documentList().title("Blog").schemaType("post").filter('_type == "post" && postType == "blog"')),
              S.documentTypeListItem("post").title("All posts"),
              S.documentTypeListItem("postCategory").title("Post categories"),
              S.documentTypeListItem("download").title("Brochures & downloads"),
            ]),
        ),
      S.listItem()
        .title("Company")
        .icon(UsersIcon)
        .child(
          S.list()
            .title("Company")
            .items([
              S.documentTypeListItem("teamMember").title("Leadership team"),
              S.documentTypeListItem("job").title("Job openings"),
              S.documentTypeListItem("certificate").title("Certificates & standards"),
              S.documentTypeListItem("faq").title("FAQs"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Leads & enquiries")
        .icon(InboxIcon)
        .child(
          S.list()
            .title("Leads & enquiries")
            .items([
              S.listItem()
                .title("New")
                .child(
                  S.documentList()
                    .title("New leads")
                    .schemaType("submission")
                    .filter('_type == "submission" && status == "new"')
                    .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
                ),
              ...["quote", "enquiry", "contact", "callback", "career", "newsletter"].map((t) =>
                S.listItem()
                  .title(t[0].toUpperCase() + t.slice(1))
                  .child(
                    S.documentList()
                      .title(t)
                      .schemaType("submission")
                      .filter('_type == "submission" && formType == $t')
                      .params({ t })
                      .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
                  ),
              ),
              S.documentTypeListItem("submission").title("All submissions"),
            ]),
        ),
      S.documentTypeListItem("redirect").title("Redirects"),
    ]);
