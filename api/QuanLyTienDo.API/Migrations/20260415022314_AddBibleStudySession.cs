using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyTienDo.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBibleStudySession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BibleStudySessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Chapter = table.Column<int>(type: "int", nullable: false),
                    VerseFrom = table.Column<int>(type: "int", nullable: false),
                    VerseTo = table.Column<int>(type: "int", nullable: false),
                    Passage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ObservationJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InterpretationJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApplicationJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedStepsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShareMode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BibleStudySessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BibleStudySessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BibleStudySessions_UserId_BookId_Chapter",
                table: "BibleStudySessions",
                columns: new[] { "UserId", "BookId", "Chapter" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BibleStudySessions");
        }
    }
}
