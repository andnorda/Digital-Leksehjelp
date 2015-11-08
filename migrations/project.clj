(defproject rcmigration "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [http-kit "2.1.16"]
                 [hickory "0.5.4"]
                 [clj-time "0.8.0"]
                 [enlive "1.1.5"]
                 [net.htmlparser.jericho/jericho-html "3.1"]
                 [com.novemberain/monger "2.0.0"]
                 [org.clojure/data.json "0.2.5"]]
  :main ^:skip-aot rcmigration.core
  :target-path "target/%s"
  :jvm-opts ["-Xmx1G"]
  :plugins [[cider/cider-nrepl "0.8.1"]]
  :profiles {:uberjar {:aot :all}})
