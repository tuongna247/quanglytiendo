using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyTienDo.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFixedExpenseType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "FixedExpenses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "FixedExpenses");
        }
    }
}
