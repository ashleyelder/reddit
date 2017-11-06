Rails.application.routes.draw do
  get '/signup', to: 'users#new'
  post '/signup', to: 'users#create'
  get '/login', to: 'sessions#new'
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'
  get 'users/:username', to: 'users#show'
  get 'users/:username/user_posts', to: 'users#user_posts'
  get 'posts/new_text', to: 'posts#new_text'
  get 'posts/new_link', to: 'posts#new_link'
  post 'posts/new_text', to: 'posts#create_text'
  post 'posts/new_link', to: 'posts#create_link'
  get 'search', to: 'search#search'

  root 'posts#index'

  resources :posts do
    resources :comments
    resources :votes
  end

  resources :comments do
    resources :comments
    resources :votes
  end

  resources :users do
    resources :comments
  end

  resources :votes do
  end
end
