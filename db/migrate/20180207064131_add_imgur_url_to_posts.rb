class AddImgurUrlToPosts < ActiveRecord::Migration[5.1]
  def change
    add_column :posts, :imgur_url, :string
  end
end
