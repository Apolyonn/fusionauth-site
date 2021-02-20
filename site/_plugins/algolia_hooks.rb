module Jekyll
  module Algolia
    module Hooks
     # from https://community.algolia.com/jekyll-algolia/hooks.html
     # don't send entire html
     # not sure if we need it
     def self.before_indexing_each(record, node, context)
        record[:html] = nil
        record
      end
    end
  end
end
