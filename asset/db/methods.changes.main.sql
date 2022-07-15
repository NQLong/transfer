CREATE OR REPLACE FUNCTION DT_DANH_SACH_MON_MO_GET_CURRENT(TG_MO_MON IN STRING, CHUONG_TRINH_DAO_TAO OUT SYS_REFCURSOR,
                                                THONG_TIN OUT SYS_REFCURSOR)
    RETURN SYS_REFCURSOR
AS
    DANH_SACH_MON_MO  SYS_REFCURSOR;
    KHOA_SINH_VIEN    NUMBER(4);
    HOC_KY_MO_MON     NUMBER(1);
    ID_DANG_KY_MO_MON NUMBER;
BEGIN
    SELECT JSON_VALUE(TG_MO_MON, '$.khoa') INTO KHOA_SINH_VIEN FROM DUAL;
    SELECT JSON_VALUE(TG_MO_MON, '$.hocKy') INTO HOC_KY_MO_MON FROM DUAL;
    SELECT JSON_VALUE(TG_MO_MON, '$.idDangKyMoMon') INTO ID_DANG_KY_MO_MON FROM DUAL;

    OPEN THONG_TIN FOR
        SELECT DKMM.KHOA              AS "khoaDangKy",
               DKMM.MA_NGANH          AS "maNganh",
               NDT.TEN_NGANH          AS "tenNganh",
               DV.TEN                 AS "tenKhoaDangKy",
               DKMM.IS_DUYET          AS "isDuyet",
               DKMM.LOAI_HINH_DAO_TAO AS "loaiHinhDaoTao",
               DKMM.BAC_DAO_TAO       AS "bacDaoTao"
        FROM DT_DANG_KY_MO_MON DKMM
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = DKMM.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = DKMM.KHOA
        WHERE DKMM.ID = ID_DANG_KY_MO_MON;

    OPEN CHUONG_TRINH_DAO_TAO FOR
        SELECT CTDT.MA_MON_HOC        AS "maMonHoc",
               MH.TEN                 AS "tenMonHoc",
               CTDT.SO_TIET_LY_THUYET AS "soTietLyThuyet",
               CTDT.SO_TIET_THUC_HANH AS "soTietThucHanh",
               CTDT.HOC_KY_DU_KIEN    AS "hocKyDuKien",
               CTDT.LOAI_MON_HOC      AS "loaiMonHoc",
               CTDT.KHOA              AS "khoa",
               MH.KHOA                AS "monHocKhoa",
               CTDT.TONG_SO_TIET      AS "tongSoTiet",
               CTKDT.KHOA             AS "khoaSinhVien"

        FROM DT_CHUONG_TRINH_DAO_TAO CTDT
                 LEFT JOIN DT_KHUNG_DAO_TAO KDT ON KDT.ID = CTDT.MA_KHUNG_DAO_TAO
                 LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT on KDT.NAM_DAO_TAO = CTKDT.ID
                 LEFT JOIN DT_DANG_KY_MO_MON DKMM ON DKMM.MA_NGANH = KDT.MA_NGANH
                 LEFT JOIN DM_MON_HOC MH ON MH.MA = CTDT.MA_MON_HOC
        WHERE DKMM.ID = ID_DANG_KY_MO_MON
            AND MH.KHOA != 33
            AND
            --E.g: Current Semester: 1, Current Year: 2022
              (CTKDT.KHOA = KHOA_SINH_VIEN AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON)         -- Student 2022 - Sem 1
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 1 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 2) -- Student 2021 - Sem 3
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 2 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 4) -- Student 2021 - Sem 3
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 3 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 6) -- Student 2021 - Sem 3
    ;


    OPEN DANH_SACH_MON_MO FOR
        SELECT DS.MA_MON_HOC        as "maMonHoc",
               DS.TEN_MON_HOC       AS "tenMonHoc",
               DS.LOAI_MON_HOC      AS "loaiMonHoc",
               DS.SO_TIET_LY_THUYET AS "soTietLyThuyet",
               DS.SO_TIET_THUC_HANH AS "soTietThucHanh",
               DS.NAM               AS "nam",
               DS.HOC_KY            AS "hocKy",
               DS.MA_NGANH          AS "maNganh",
               DS.CHUYEN_NGANH      AS "chuyenNganh",
               DS.ID                AS "id",
               DS.SO_LOP            AS "soLop",
               DS.SO_BUOI_TUAN      AS "soBuoiTuan",
               DS.SO_TIET_BUOI      AS "soTietBuoi",
               DS.SO_LUONG_DU_KIEN  AS "soLuongDuKien",
               DS.KHOA              AS "monHocKhoa",
               DS.KHOA_SV           AS "khoaSv",
               CN.TEN               AS "tenChuyenNganh",
               DS.MA_DANG_KY        AS "maDangKy"
        FROM DT_DANH_SACH_MON_MO DS
                 LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = DS.CHUYEN_NGANH
        WHERE DS.MA_DANG_KY = ID_DANG_KY_MO_MON;

    return DANH_SACH_MON_MO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_TRINH_KY_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    shccCanBo IN STRING,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN

    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_TRINH_KY cvtk
-- LEFT JOIN HCTH_CAN_BO_NHAN hcthcbn ON hcthcbn.KEY = nv.ID AND hcthcbn.LOAI = 'NHIEM_VU'
             LEFT JOIN HCTH_CAN_BO_KY cbk on cvtk.ID = cbk.CONG_VAN_TRINH_KY
    where (
                      cvtk.NGUOI_TAO = shccCanBo
                  OR cbk.NGUOI_KY = shccCanBo
              );
    IF pageNumber < 1 THEN
        pageNumber := 1;
    END IF;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT cvtk.ID               as "id",
                     cvtk.FILE_CONG_VAN    as "congVanId",
                     cvtk.NGUOI_TAO        as "nguoiTao",
                     cvtk.THOI_GIAN        as "thoiGian",
                     cbt.HO                as "hoNguoiTao",
                     cbt.TEN               as "tenNguoiTao",
                     hcthcvd.TRICH_YEU     as "trichYeu",
                     hcthcvd.LOAI_CONG_VAN as "loaiCongVan",
                     (SELECT LISTAGG(
                                     CASE
                                         WHEN cb.HO IS NULL THEN cb.TEN
                                         WHEN cb.TEN IS NULL THEN cb.HO
                                         ELSE CONCAT(CONCAT(cb.HO, ' '), cb.TEN)
                                         END,
                                     ';'
                                 ) WITHIN GROUP (
                                         order by cb.TEN
                                         ) as "hoVaTenCanBo"
                      FROM HCTH_CAN_BO_KY cbk
                               LEFT JOIN TCHC_CAN_BO cb on cbk.NGUOI_KY = cb.SHCC
                      where cbk.CONG_VAN_TRINH_KY = cvtk.id
                     )                     as "danhSachCanBoKy",

                     ROW_NUMBER() OVER (
                         ORDER BY cvtk.ID DESC
                         )                    R
              FROM HCTH_CONG_VAN_TRINH_KY cvtk
                       LEFT JOIN TCHC_CAN_BO cbt on cbt.SHCC = cvtk.NGUOI_TAO
                       LEFT JOIN HCTH_FILE hcthfile on hcthfile.LOAI = 'DI' and hcthfile.ID = cvtk.FILE_CONG_VAN
                       LEFT JOIN HCTH_CONG_VAN_DI hcthcvd on hcthcvd.ID = hcthfile.MA
                       LEFT JOIN HCTH_CAN_BO_KY cbk on cvtk.ID = cbk.CONG_VAN_TRINH_KY
              WHERE
-- check if user is related to congVanTrinhKy
(
            cvtk.NGUOI_TAO = shccCanBo
        OR cbk.NGUOI_KY = shccCanBo
    ))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, imssv IN STRING,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER, totalCurrent OUT NUMBER,
                                       totalPaid OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NUMBER(4); listBacDaoTao NVARCHAR2(200);
    hocKy     NUMBER(1); listLoaiHinhDaoTao NVARCHAR2(200);
    daDong    NUMBER(1); listKhoa NVARCHAR2(500);
    listNganh NVARCHAR2(500);
    tuNgay    NUMBER(20);
    denNgay   NUMBER(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.daDong') INTO daDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tuNgay') INTO tuNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.denNgay') INTO denNgay FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
             LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
        AND HP.NAM_HOC = THPT.NAM_HOC
        AND HP.MSSV = THPT.CUSTOMER_ID
        AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                               FROM TC_HOC_PHI_TRANSACTION TRANS
                               WHERE HP.HOC_KY = TRANS.HOC_KY
                                 AND HP.NAM_HOC = TRANS.NAM_HOC
                                 AND HP.MSSV = TRANS.CUSTOMER_ID)

    WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV)
      AND (
            daDong IS NULL OR daDong = ''
            OR daDong = 1 AND HP.CONG_NO = 0
            OR daDong = 0 AND HP.CONG_NO != 0
        )
      AND (listNganh IS NULL OR
           listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
      AND (listKhoa IS NULL OR
           listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (listLoaiHinhDaoTao IS NULL OR
           listLoaiHinhDaoTao IS NOT NULL AND
           FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                    from dual
                                    connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
      AND (HP.NAM_HOC = namHoc AND HP.HOC_KY = hocKy)
      AND (searchTerm = ''
        OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
        OR FS.MSSV LIKE ST)
      and ((tuNgay is not null and denNgay is not null) or
           (
                       IS_NUMERIC(THPT.TRANS_DATE) = 1
                   and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                   and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
               )
        )
--        OR FS.MSSV LIKE ST
    ;

    SELECT COUNT(*)
    INTO totalCurrent
    FROM TC_HOC_PHI HP
    WHERE NAM_HOC = namHoc
      AND HOC_KY = hocKy;

    SELECT COUNT(*)
    INTO totalPaid
    FROM TC_HOC_PHI HP
    WHERE NAM_HOC = namHoc
      AND HOC_KY = hocKy
      AND HP.CONG_NO = 0;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT HP.MSSV                  AS         "mssv",
                     HP.NAM_HOC               AS         "namHoc",
                     HP.HOC_KY                AS         "hocKy",
                     HP.CONG_NO               AS         "congNo",
                     HP.HOC_PHI               AS         "hocPhi",
                     FS.HO                    as         "ho",
                     FS.TEN                   AS         "ten",
                     FS.GIOI_TINH             AS         "gioiTinh",
                     FS.NGAY_SINH             AS         "ngaySinh",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     FS.DIEN_THOAI_CA_NHAN    AS         "soDienThoai",
                     FS.EMAIL_CA_NHAN         AS         "emailCaNhan",
                     FS.MA_NGANH              AS         "maNganh",
                     NDT.TEN_NGANH            AS         "tenNganh",
                     DV.TEN                   AS         "tenKhoa",
                     LHDT.TEN                 AS         "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC              AS         "tenBacDaoTao",
                     THPT.TRANS_ID            AS         "lastTransactionId",
                     THPT.TRANS_DATE          AS         "lastTransaction",

--                      (SELECT TRANS_DATE
--                       FROM TC_HOC_PHI_TRANSACTION
--                       WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
--                                           FROM TC_HOC_PHI_TRANSACTION TRANS
--                                           WHERE HP.HOC_KY = TRANS.HOC_KY
--                                             AND HP.NAM_HOC = TRANS.NAM_HOC
--                                             AND HP.MSSV = TRANS.CUSTOMER_ID)) AS "lastTransaction",
--
--                      (SELECT TRANS_ID
--                       FROM TC_HOC_PHI_TRANSACTION
--                       WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
--                                           FROM TC_HOC_PHI_TRANSACTION TRANS
--                                           WHERE HP.HOC_KY = TRANS.HOC_KY
--                                             AND HP.NAM_HOC = TRANS.NAM_HOC
--                                             AND HP.MSSV = TRANS.CUSTOMER_ID)) AS "lastTransactionId",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI HP
                       LEFT JOIN FW_STUDENT FS
                                 on HP.MSSV = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                       LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
                  AND HP.NAM_HOC = THPT.NAM_HOC
                  AND HP.MSSV = THPT.CUSTOMER_ID
                  AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                         FROM TC_HOC_PHI_TRANSACTION TRANS
                                         WHERE HP.HOC_KY = TRANS.HOC_KY
                                           AND HP.NAM_HOC = TRANS.NAM_HOC
                                           AND HP.MSSV = TRANS.CUSTOMER_ID)
              WHERE (imssv IS NULL
                  OR imssv = ''
                  OR imssv = HP.MSSV)
                AND (
                      daDong IS NULL
                      OR daDong = ''
                      OR daDong = 1
                          AND HP.CONG_NO = 0
                      OR daDong = 0
                          AND HP.CONG_NO != 0
                  )
                AND (listNganh IS NULL
                  OR
                     listNganh IS NOT NULL
                         AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh
                                                        , '[^,]+'
                                                        , 1
                                                        , level)
                                             from dual
                                             connect by regexp_substr(listNganh
                                                            , '[^,]+'
                                                            , 1
                                                            , level) is not null))
                AND (listKhoa IS NULL
                  OR
                     listKhoa IS NOT NULL
                         AND FS.KHOA IN (SELECT regexp_substr(listKhoa
                                                    , '[^,]+'
                                                    , 1
                                                    , level)
                                         from dual
                                         connect by regexp_substr(listKhoa
                                                        , '[^,]+'
                                                        , 1
                                                        , level) is not null))
                AND (listBacDaoTao IS NULL
                  OR
                     listBacDaoTao IS NOT NULL
                         AND
                     FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao
                                                   , '[^,]+'
                                                   , 1
                                                   , level)
                                        from dual
                                        connect by regexp_substr(listBacDaoTao
                                                       , '[^,]+'
                                                       , 1
                                                       , level) is not null))
                AND (listLoaiHinhDaoTao IS NULL
                  OR
                     listLoaiHinhDaoTao IS NOT NULL
                         AND
                     FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao
                                                         , '[^,]+'
                                                         , 1
                                                         , level)
                                              from dual
                                              connect by regexp_substr(listLoaiHinhDaoTao
                                                             , '[^,]+'
                                                             , 1
                                                             , level) is not null))
                AND (HP.NAM_HOC = namHoc
                  AND HP.HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
                  OR FS.MSSV LIKE ST)
                and ((tuNgay is not null and denNgay is not null) or
                     (
                                 IS_NUMERIC(THPT.TRANS_DATE) = 1
                             and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                             and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                         )
                  ))


        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION IS_NUMERIC(P_INPUT IN VARCHAR2) RETURN INTEGER IS
  RESULT INTEGER;
  NUM NUMBER ;
BEGIN
  NUM:=TO_NUMBER(P_INPUT);
  RETURN 1;
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END IS_NUMERIC;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_DOWNLOAD_PSC(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;

    OPEN my_cursor FOR
        SELECT FS.MSSV         AS                           "mssv",
               FS.HO           AS                           "ho",
               FS.TEN          AS                           "ten",
               THPT.HOC_KY     AS                           "hocKy",
               THPT.BANK       as                           "nganHang",
               THPT.NAM_HOC    AS                           "namHoc",
               THPT.AMOUNT     AS                           "khoanDong",
               FS.MA_NGANH     AS                           "maNganh",
               NDT.TEN_NGANH   AS                           "tenNganh",
               DV.TEN          AS                           "tenKhoa",
               LHDT.TEN        AS                           "tenLoaiHinhDaoTao",
               BDT.TEN_BAC     AS                           "tenBacDaoTao",
               THPT.TRANS_DATE AS                           "ngayDong",

               ROW_NUMBER() OVER (ORDER BY THPT.TRANS_DATE) R
        FROM TC_HOC_PHI_TRANSACTION THPT
                 LEFT JOIN FW_STUDENT FS
                           on THPT.CUSTOMER_ID = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
    where THPT.NAM_HOC = namHoc and THPT.HOC_KY = hocKy;

    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                   searchTerm IN STRING, filter IN STRING,
                                                   totalItem OUT NUMBER, pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
    tuNgay    NUMBER(20);
    denNgay   NUMBER(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tuNgay') INTO tuNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.denNgay') INTO denNgay FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI_TRANSACTION THPT
             LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
             LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
             LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
             LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
    where THPT.NAM_HOC = namHoc
      and THPT.STATUS = 1
      and THPT.HOC_KY = hocKy
      and ((tuNgay is not null and denNgay is not null) or
           (
                       IS_NUMERIC(THPT.TRANS_DATE) = 1
                   and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                   and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
               )
        )
      and (
          searchTerm = '' or
                LOWER(FS.HO) like sT or
                LOWER(NDT.TEN_NGANH) like sT or
                LOWER(BDT.TEN_BAC) like sT or
                LOWER(FS.MSSV) like sT or
                LOWER(FS.TEN) like sT
        );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT FS.MSSV         AS                  "mssv",
                     FS.HO           AS                  "ho",
                     FS.TEN          AS                  "ten",
                     THPT.HOC_KY     AS                  "hocKy",
                     THPT.BANK       as                  "nganHang",
                     THPT.NAM_HOC    AS                  "namHoc",
                     THPT.AMOUNT     AS                  "khoanDong",
                     FS.MA_NGANH     AS                  "maNganh",
                     NDT.TEN_NGANH   AS                  "tenNganh",
                     DV.TEN          AS                  "tenKhoa",
                     LHDT.TEN        AS                  "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC     AS                  "tenBacDaoTao",
                     THPT.TRANS_DATE AS                  "ngayDong",
                     THPT.STATUS     AS                  "trangThai",

                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI_TRANSACTION THPT
                       LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
              where THPT.NAM_HOC = namHoc
                and THPT.HOC_KY = hocKy
                and ((tuNgay is not null and denNgay is not null) or
                     (
                                 IS_NUMERIC(THPT.TRANS_DATE) = 1
                             and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                             and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                         )
                  )
                and THPT.STATUS = 1
                and (
                    searchTerm = '' or
                          LOWER(FS.HO) like sT or
                          LOWER(NDT.TEN_NGANH) like sT or
                          LOWER(BDT.TEN_BAC) like sT or
                          LOWER(FS.MSSV) like sT or
                          LOWER(FS.TEN) like sT
                  ))


        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

