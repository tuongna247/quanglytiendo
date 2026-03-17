using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyTienDo.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEbookTablesV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EbookBooks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PagesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalPages = table.Column<int>(type: "int", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EbookBooks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EbookBooks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EbookBookmarks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageNumber = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EbookBookmarks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EbookBookmarks_EbookBooks_BookId",
                        column: x => x.BookId,
                        principalTable: "EbookBooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EbookComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageNumber = table.Column<int>(type: "int", nullable: false),
                    HighlightId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StartOffset = table.Column<int>(type: "int", nullable: false),
                    EndOffset = table.Column<int>(type: "int", nullable: false),
                    SelectedText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EbookComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EbookComments_EbookBooks_BookId",
                        column: x => x.BookId,
                        principalTable: "EbookBooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EbookHighlights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageNumber = table.Column<int>(type: "int", nullable: false),
                    StartOffset = table.Column<int>(type: "int", nullable: false),
                    EndOffset = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EbookHighlights", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EbookHighlights_EbookBooks_BookId",
                        column: x => x.BookId,
                        principalTable: "EbookBooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EbookProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CurrentPage = table.Column<int>(type: "int", nullable: false),
                    LastReadAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EbookProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EbookProgresses_EbookBooks_BookId",
                        column: x => x.BookId,
                        principalTable: "EbookBooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EbookBookmarks_BookId",
                table: "EbookBookmarks",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_EbookBooks_UserId",
                table: "EbookBooks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EbookComments_BookId",
                table: "EbookComments",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_EbookHighlights_BookId",
                table: "EbookHighlights",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_EbookProgresses_BookId",
                table: "EbookProgresses",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_EbookProgresses_UserId_BookId",
                table: "EbookProgresses",
                columns: new[] { "UserId", "BookId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EbookBookmarks");

            migrationBuilder.DropTable(
                name: "EbookComments");

            migrationBuilder.DropTable(
                name: "EbookHighlights");

            migrationBuilder.DropTable(
                name: "EbookProgresses");

            migrationBuilder.DropTable(
                name: "EbookBooks");
        }
    }
}
