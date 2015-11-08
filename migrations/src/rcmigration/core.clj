(ns rcmigration.core
  (:require  [org.httpkit.client :as http]
             [monger.core :as mg]
             [clj-time.core :as t]
             [clj-time.format :as f]
             [monger.collection :as mc]
             [clojure.data.json :as json])
   (:import [org.bson.types ObjectId]
           [com.mongodb DB WriteConcern])
  (:gen-class))

(def db (:db (mg/connect-via-uri "mongodb://<dbuser>:<dbpassword>@ds012345.mongolab.com:56789/dbname")))

(def formatter (f/formatter "YYYY-MM-dd HH:mm:ss"))

(defn mongo-get-user-id [user] (:_id (first (mc/find-maps db "users" {:username user}))))

(defn mongo-get-subjects [] (into {} (map (fn [a] (vector (a :name) (a :_id))) (mc/find-maps db "subjects" {}))))

(defn migrate-json [data]
  (map (fn [d] {:question (clojure.string/replace (d "question") #"<p>|</p>|<strong>|</strong>|&nbsp;|<br />|<br>|<div>|</div>|<em>|</em>" "")
                :answer (d "answer")
                :answeredBy (mongo-get-user-id "Nettleksehjelpen.no")
                :lastUpdatedBy (mongo-get-user-id "Nettleksehjelpen.no")
                :publishedBy (mongo-get-user-id "Nettleksehjelpen.no")
                :subjectId ((mongo-get-subjects) (d "subject"))
                :grade (d "grade")
                :answerDate (.toDate (f/parse formatter (d "answerDate")))
                :lastUpdatedDate (.toDate (f/parse formatter (d "answerDate")))
                :questionDate (.toDate (f/parse formatter (d "questionDate")))}) data))

(defn load-json [] (json/read-str (slurp "data.json")))

(defn mongo-insert [data]  (map (fn [i]
                                  (mc/insert db "questions"
                                             (merge { :_id (.toString (ObjectId.)) } i))) data))

(defn -main
  [& args]
  (mongo-insert (migrate-json (load-json))))
