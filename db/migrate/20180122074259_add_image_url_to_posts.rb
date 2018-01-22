class AddImageUrlToPosts < ActiveRecord::Migration[5.1]
  def change
    add_column :posts, :image_url, :string
  end
end
