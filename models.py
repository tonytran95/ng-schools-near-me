from mongoengine import Document, IntField, StringField, EmailField, URLField, PointField, BooleanField, FloatField, \
                        ListField


class School(Document):
    code = IntField(required=True, primary_key=True)
    name = StringField(required=True)
    street = StringField(required=True)
    suburb = StringField(required=True)
    postcode = IntField(required=True)
    phone = StringField(required=True)
    email = EmailField(required=True)
    website = URLField(required=True)
    logo = URLField(required=False)
    fax = StringField(required=True)
    enrolments = IntField(required=True)
    level = StringField(required=True)
    opportunity_classes = BooleanField(requred=True)
    specialty_type = StringField(required=True)
    subtype = StringField(required=True)
    selective = StringField(required=True)
    gender = StringField(required=True)
    location = PointField(required=True)
    preschool = BooleanField(required=True)
    late_opening = BooleanField(required=True)
    intensive_english_centre = BooleanField(required=True)
    healthy_canteen = BooleanField(required=True)
    indigenous_pct = FloatField(required=True)
    lbote_pct = FloatField(required=True)
    icsea = IntField(required=True)
    support_classes = ListField(required=False)
    attendance_rate = FloatField(required=False)
    selective_entry_score = IntField(required=False)
    opportunity_classes_entry_score = IntField(required=False)
    train_station_id = StringField(required=False)
    train_station = StringField(required=False)
    train_distance = IntField(required=False)
    train_duration = IntField(required=False)
    meta = {'collection': 'schools'}

    def __init__(self, code, name, street, suburb, postcode, phone, email, website, fax, enrolments,
                 level, opportunity_classes, specialty_type, subtype, selective, gender, location, preschool,
                 late_opening, intensive_english_centre, healthy_canteen, indigenous_pct, lbote_pct, icsea,
                 *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.code = code
        self.name = name
        self.street = street
        self.suburb = suburb
        self.postcode = postcode
        self.phone = phone
        self.email = email
        self.website = website
        self.fax = fax
        self.enrolments = enrolments
        self.level = level
        self.opportunity_classes = opportunity_classes
        self.specialty_type = specialty_type
        self.subtype = subtype
        self.selective = selective
        self.gender = gender
        self.location = location
        self.preschool = preschool
        self.late_opening = late_opening
        self.intensive_english_centre = intensive_english_centre
        self.healthy_canteen = healthy_canteen
        self.indigenous_pct = indigenous_pct
        self.lbote_pct = lbote_pct
        self.icsea = icsea
