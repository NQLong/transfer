CREATE OR REPLACE FUNCTION TC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, imssv IN STRING,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER, totalCurrent OUT NUMBER,
                                       totalPaid OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    sT           STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc       NUMBER(4); listBacDaoTao NVARCHAR2(200);
    hocKy        NUMBER(1); listLoaiHinhDaoTao NVARCHAR2(200);
    daDong       NUMBER(1); listKhoa NVARCHAR2(500);
    listNganh    NVARCHAR2(500);
    tuNgay       NUMBER(20);
    denNgay      NUMBER(20);
    namTuyenSinh NUMBER(4);
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
    SELECT JSON_VALUE(filter, '$.namTuyenSinh') INTO namTuyenSinh FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    from (select ROW_NUMBER() OVER (partition by HP.MSSV ORDER BY THPT.STATUS DESC ,THPT.TRANS_DATE DESC) RN
          FROM TC_HOC_PHI HP
                   LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
                   LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
              AND HP.NAM_HOC = THPT.NAM_HOC
              AND HP.MSSV = THPT.CUSTOMER_ID
              AND THPT.STATUS = 1

          WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV)
            AND (HP.NAM_HOC = namHoc AND HP.HOC_KY = hocKy)
            AND (
                      daDong IS NULL OR daDong = ''
                  OR (daDong = 1 AND HP.CONG_NO <= 0)
                  OR (daDong = 0 AND HP.CONG_NO > 0)
              )
            and (namTuyenSinh is null or fs.NAM_TUYEN_SINH = namTuyenSinh)
            AND (listNganh IS NULL OR
                  FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
            AND (listKhoa IS NULL OR
                  FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                      from dual
                                                      connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
            AND (listBacDaoTao IS NULL OR
                  FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
            AND (listLoaiHinhDaoTao IS NULL OR
                 FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
            AND (searchTerm = ''
              OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
              OR FS.MSSV LIKE ST)
            and ((tuNgay is null and denNgay is null) or
                 (
                             IS_NUMERIC(THPT.TRANS_DATE) = 1
                         and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                         and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                     )
              )) temp
    where temp.RN = 1;

    SELECT COUNT(*)
    INTO totalPaid
    from (select ROW_NUMBER() OVER (partition by HP.MSSV ORDER BY THPT.STATUS DESC ,THPT.TRANS_DATE DESC) RN
          FROM TC_HOC_PHI HP
                   LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
                   LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
              AND HP.NAM_HOC = THPT.NAM_HOC
              AND HP.MSSV = THPT.CUSTOMER_ID
              AND THPT.STATUS = 1

          WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV)
            AND (HP.NAM_HOC = namHoc AND HP.HOC_KY = hocKy)
            and HP.CONG_NO <= 0
            AND (
                      daDong IS NULL OR daDong = ''
                  OR (daDong = 1 AND HP.CONG_NO <= 0)
                  OR (daDong = 0 AND HP.CONG_NO > 0)
              )
            and (namTuyenSinh is null or fs.NAM_TUYEN_SINH = namTuyenSinh)
            AND (listNganh IS NULL OR
                   FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
            AND (listKhoa IS NULL OR
                  FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                      from dual
                                                      connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
            AND (listBacDaoTao IS NULL OR
                   FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
            AND (listLoaiHinhDaoTao IS NULL OR
                 FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
            AND (searchTerm = ''
              OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
              OR FS.MSSV LIKE ST)
            and ((tuNgay is null and denNgay is null) or
                 (
                             IS_NUMERIC(THPT.TRANS_DATE) = 1
                         and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                         and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                     )
              )) temp
    where temp.RN = 1;



    SELECT COUNT(*)
    INTO totalCurrent
    FROM TC_HOC_PHI HP
    WHERE NAM_HOC = namHoc
      AND HOC_KY = hocKy;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor For
        select *
        from (
                 select temp."mssv",
                        temp."namHoc",
                        temp."hocKy",
                        temp."congNo",
                        temp."hocPhi",
                        temp."ho",
                        temp."ten",
                        temp."gioiTinh",
                        temp."ngaySinh",
                        temp."soDienThoai",
                        temp."emailCaNhan",
                        temp."maNganh",
                        temp."tenNganh",
                        temp."tenKhoa",
                        temp."tenLoaiHinhDaoTao",
                        temp."tenBacDaoTao",
                        temp."lastTransactionId",
                        temp."lastTransaction",
                        temp."invoiceId",
                        temp."hoTenSinhVien",
                        ROW_NUMBER() OVER (ORDER BY temp."ten", temp."ho", temp."mssv") R

                 from (SELECT HP.MSSV                  AS                                                              "mssv",
                              HP.NAM_HOC               AS                                                              "namHoc",
                              HP.HOC_KY                AS                                                              "hocKy",
                              HP.CONG_NO               AS                                                              "congNo",
                              HP.HOC_PHI               AS                                                              "hocPhi",
                              FS.HO                    as                                                              "ho",
                              FS.TEN                   AS                                                              "ten",
                              (FS.HO || ' ' || FS.TEN) AS                                                              "hoTenSinhVien",

                              FS.GIOI_TINH             AS                                                              "gioiTinh",
                              FS.NGAY_SINH             AS                                                              "ngaySinh",
                              FS.DIEN_THOAI_CA_NHAN    AS                                                              "soDienThoai",
                              FS.EMAIL_CA_NHAN         AS                                                              "emailCaNhan",
                              FS.MA_NGANH              AS                                                              "maNganh",
                              NDT.TEN_NGANH            AS                                                              "tenNganh",
                              DV.TEN                   AS                                                              "tenKhoa",
                              LHDT.TEN                 AS                                                              "tenLoaiHinhDaoTao",
                              BDT.TEN_BAC              AS                                                              "tenBacDaoTao",
                              THPT.TRANS_ID            AS                                                              "lastTransactionId",
                              THPT.TRANS_DATE          AS                                                              "lastTransaction",
                              HPI.ID                   AS                                                              "invoiceId",

                              ROW_NUMBER() OVER (partition by HP.MSSV ORDER BY THPT.STATUS DESC ,THPT.TRANS_DATE DESC) RN
                       FROM TC_HOC_PHI HP
                                LEFT JOIN FW_STUDENT FS
                                          on HP.MSSV = FS.MSSV
                                LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                                LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                                LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                                LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                                LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE HPI
                                          on HPI.MSSV = HP.MSSV and HPI.NAM_HOC = HP.NAM_HOC and
                                             HP.HOC_KY = HPI.HOC_KY and
                                             HPI.LY_DO_HUY is null
                                LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
                           AND HP.NAM_HOC = THPT.NAM_HOC
                           AND HP.MSSV = THPT.CUSTOMER_ID
                           AND THPT.STATUS = 1
                       WHERE (imssv IS NULL
                           OR imssv = ''
                           OR imssv = HP.MSSV)
                         and (namTuyenSinh is null or fs.NAM_TUYEN_SINH = namTuyenSinh)

                         AND (
                                   daDong IS NULL OR daDong = '' OR (daDong = 1 AND HP.CONG_NO <= 0) OR
                                   (daDong = 0 AND HP.CONG_NO > 0)
                           )
                         AND (listNganh IS NULL
                           OR FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                      from dual
                                                      connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
                         AND (listKhoa IS NULL
                           OR FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
                         AND (listBacDaoTao IS NULL
                           OR FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                         AND (listLoaiHinhDaoTao IS NULL OR FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
                         AND (HP.NAM_HOC = namHoc
                           AND HP.HOC_KY = hocKy)
                         AND (searchTerm = ''
                           OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
                           OR FS.MSSV LIKE ST)
                         and ((tuNgay is null and denNgay is null) or
                              (
                                          IS_NUMERIC(THPT.TRANS_DATE) = 1
                                      and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                                      and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                                  )
                           )
                      ) temp
                 where temp.RN = 1)
        where R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        order by R;

    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_GET_STATISTIC(filter IN STRING, tongSoGiaoDich OUT NUMBER) RETURN NUMBER
AS
    namHoc           NUMBER(10);
    hocKy            NUMBER(10);
    namTuyenSinh     NUMBER(10);
    bac              NVARCHAR2(10);
    nganh            NVARCHAR2(20);
    loaiHinh         NVARCHAR2(20);
    batDau           number(20);
    ketThuc          number(20);
    tongTienGiaoDich NUMBER(22);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namTuyenSinh') INTO namTuyenSinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTao') INTO bac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiDaoTao') INTO loaiHinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganh') INTO nganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.batDau') INTO batDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ketThuc') INTO ketThuc FROM DUAL;


    select COUNT(*)
    into tongSoGiaoDich
    from TC_HOC_PHI_TRANSACTION TT
             LEFT JOIN FW_STUDENT FS on TT.CUSTOMER_ID = FS.MSSV
    where TT.STATUS =1 and TT.NAM_HOC = namHoc
      and TT.HOC_KY = hocKy
      and FS.NAM_TUYEN_SINH = namTuyenSinh
      AND FS.BAC_DAO_TAO = bac
      AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)

      and (batDau is null or tt.TRANS_DATE >= batDau)
      and (ketThuc is null or tt.TRANS_DATE <= ketThuc)
      AND (nganh is null or FS.MA_NGANH = nganh);

    select SUM(TT.AMOUNT)
    into tongTienGiaoDich
    from TC_HOC_PHI_TRANSACTION TT
             LEFT JOIN FW_STUDENT FS on TT.CUSTOMER_ID = FS.MSSV
    where TT.STATUS =1 and TT.NAM_HOC = namHoc
      and TT.HOC_KY = hocKy
      and FS.NAM_TUYEN_SINH = namTuyenSinh
      AND FS.BAC_DAO_TAO = bac
      AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)

      and (batDau is null or tt.TRANS_DATE >= batDau)
      and (ketThuc is null or tt.TRANS_DATE <= ketThuc)
      AND (nganh is null or FS.MA_NGANH = nganh);

    return tongTienGiaoDich;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                   searchTerm IN STRING, filter IN STRING,
                                                   totalItem OUT NUMBER, pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    sT                 STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc             NUMBER(4);
    hocKy              NUMBER(1);
    tuNgay             NUMBER(20);
    denNgay            NUMBER(20);
    namTuyenSinh       NUMBER(4);
    listBacDaoTao      NVARCHAR2(200);
    listLoaiHinhDaoTao NVARCHAR2(200);
    listKhoa           NVARCHAR2(500);
    listNganh          NVARCHAR2(500);
    nganHang           NVARCHAR2(500);

BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tuNgay') INTO tuNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.denNgay') INTO denNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganHang') INTO nganHang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namTuyenSinh') INTO namTuyenSinh FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI_TRANSACTION THPT
             LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
             LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
             LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
             LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
    where THPT.NAM_HOC = namHoc
      and (namTuyenSinh is null or fs.NAM_TUYEN_SINH = namTuyenSinh)
      and THPT.STATUS = 1
      and THPT.HOC_KY = hocKy
      and ((tuNgay is null and denNgay is null) or
           (
                       IS_NUMERIC(THPT.TRANS_DATE) = 1
                   and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                   and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
               )
        )
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (listNganh IS NULL OR
           listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
      AND (listKhoa IS NULL OR
           listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
      AND (nganHang IS NULL OR
           THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
                         from dual
                         connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null))
      AND (listLoaiHinhDaoTao IS NULL OR
           listLoaiHinhDaoTao IS NOT NULL AND
           FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                    from dual
                                    connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
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
        FROM (SELECT FS.MSSV                      AS              "mssv",
                     FS.HO                        AS              "ho",
                     FS.TEN                       AS              "ten",
                     THPT.HOC_KY                  AS              "hocKy",
                     THPT.BANK                    as              "nganHang",
                     THPT.NAM_HOC                 AS              "namHoc",
                     THPT.AMOUNT                  AS              "khoanDong",
                     FS.MA_NGANH                  AS              "maNganh",
                     NDT.TEN_NGANH                AS              "tenNganh",
                     DV.TEN                       AS              "tenKhoa",
                     LHDT.TEN                     AS              "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC                  AS              "tenBacDaoTao",
                     THPT.TRANS_DATE              AS              "ngayDong",
                     THPT.STATUS                  AS              "trangThai",
                     THPT.TRANS_ID                AS              "transactionId",
                     THPT.GHI_CHU                 AS              "ghiChu",
                     ROW_NUMBER() OVER (ORDER BY THPT.TRANS_DATE DESC) R

              FROM TC_HOC_PHI_TRANSACTION THPT
                       LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO

              where THPT.NAM_HOC = namHoc
                and (namTuyenSinh is null or fs.NAM_TUYEN_SINH = namTuyenSinh)
                and THPT.HOC_KY = hocKy
                and ((tuNgay is null and denNgay is null) or
                     (
                                 IS_NUMERIC(THPT.TRANS_DATE) = 1
                             and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                             and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                         )
                  )
--                 and THPT.STATUS = 1
                AND (listBacDaoTao IS NULL OR
                     listBacDaoTao IS NOT NULL AND
                     FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                AND (listNganh IS NULL OR
                     listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
                AND (listKhoa IS NULL OR
                     listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                          from dual
                                                          connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
                AND (listLoaiHinhDaoTao IS NULL OR
                     listLoaiHinhDaoTao IS NOT NULL AND
                     FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                              from dual
                                              connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
                AND (nganHang IS NULL OR
                     THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null))

                and (
                          searchTerm = '' or
                          LOWER(FS.HO) like sT or
                          LOWER(NDT.TEN_NGANH) like sT or
                          LOWER(BDT.TEN_BAC) like sT or
                          LOWER(FS.MSSV) like sT or
                          LOWER(FS.TEN) like sT
                  )
             )


        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_LOAI_PHI_GET_STATISTIC(filter IN STRING, daDong out SYS_REFCURSOR, tongSinhVien out NUMBER,
                                          tongSinhVienDaDong out Number) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    namHoc       NUMBER(10);
    hocKy        NUMBER(10);
    namTuyenSinh NUMBER(10);
    bac          NVARCHAR2(10);
    nganh        NVARCHAR2(20);
    loaiHinh     NVARCHAR2(20);
    loaiPhi      NVARCHAR2(256);
    batDau       number(20);
    ketThuc      number(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namTuyenSinh') INTO namTuyenSinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTao') INTO bac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiDaoTao') INTO loaiHinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiPhi') INTO loaiPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganh') INTO nganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.batDau') INTO batDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ketThuc') INTO ketThuc FROM DUAL;

    select count(*)
    into tongSinhVien
    from TC_HOC_PHI HP
             LEFT JOIN FW_STUDENT FS on Hp.MSSV = FS.MSSV
    where HP.NAM_HOC = namHoc
      and HP.HOC_KY = hocKy
      and FS.NAM_TUYEN_SINH = namTuyenSinh
      AND FS.BAC_DAO_TAO = bac
      AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
      AND (nganh is null or FS.MA_NGANH = nganh);


    SELECT COUNT(*)
    INTO tongSinhVienDaDong
    from (select ROW_NUMBER() OVER (partition by HP.MSSV ORDER BY THPT.STATUS DESC ,THPT.TRANS_DATE DESC) RN
          FROM TC_HOC_PHI HP
                   LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
                   LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
              AND HP.NAM_HOC = THPT.NAM_HOC
              AND HP.MSSV = THPT.CUSTOMER_ID
              AND THPT.STATUS = 1

          WHERE (HP.NAM_HOC = namHoc AND HP.HOC_KY = hocKy)
            AND FS.BAC_DAO_TAO = bac
            and HP.CONG_NO <= 0
            and (namTuyenSinh is null or fs.NAM_TUYEN_SINH = namTuyenSinh)
            AND (nganh is null or FS.MA_NGANH = nganh)
            AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                         from dual
                                         connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
            and ((batDau is null and ketThuc is null) or
                 (
                             IS_NUMERIC(THPT.TRANS_DATE) = 1
                         and (batDau is null or TO_NUMBER(THPT.TRANS_DATE) >= batDau)
                         and (ketThuc is null or TO_NUMBER(THPT.TRANS_DATE) <= ketThuc)
                     )
              )) temp
    where temp.RN = 1;

    OPEN daDong for
        select TD."loaiPhi", TD."soTien", TD."soLuong", LP.TEN as "ten"
        from (SELECT sum(CASE
                -- phong khtc yeu cau cong don phan du vao 1 loai phi chinh
                          when HP.CONG_NO <= 0 and DT.LOAI_PHI = loaiPhi then DT.SO_TIEN - HP.CONG_NO
                          ELSE DT.SO_TIEN END) as "soTien",
                     count(DT.LOAI_PHI)        as "soLuong",
                     DT.LOAI_PHI               as "loaiPhi"
              from TC_HOC_PHI_DETAIL DT
                       LEFT JOIN (select ROW_NUMBER() OVER (partition by HP.MSSV ORDER BY THPT.STATUS DESC ,THPT.TRANS_DATE DESC) RN,
                                         Hp.MSSV,
                                         hp.HOC_KY,
                                         hp.CONG_NO,
                                         hp.NAM_HOC,
                                         thpt.TRANS_DATE
                                  FROM TC_HOC_PHI HP
                                           LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
                                      AND HP.NAM_HOC = THPT.NAM_HOC
                                      AND HP.MSSV = THPT.CUSTOMER_ID
                                      AND THPT.STATUS = 1) HP
                                 on HP.MSSV = DT.MSSV and HP.NAM_HOC = DT.NAM_HOC and HP.HOC_KY = DT.HOC_KY and
                                    HP.RN = 1
                       LEFT JOIN FW_STUDENT FS on DT.MSSV = FS.MSSV
              where DT.NAM_HOC = namHoc
                and DT.HOC_KY = hocKy
                and FS.NAM_TUYEN_SINH = namTuyenSinh
                and HP.CONG_NO <= 0
                AND FS.BAC_DAO_TAO = bac
                AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
                AND (nganh is null or FS.MA_NGANH = nganh)
              GROUP BY DT.LOAI_PHI) TD
                 LEFT JOIN TC_LOAI_PHI LP on LP.ID = TD."loaiPhi";

    OPEN my_cursor for
        select TD."loaiPhi", TD."soTien", TD."soLuong", LP.TEN as "ten"
        from (SELECT sum(DT.SO_TIEN) as "soTien", count(DT.LOAI_PHI) as "soLuong", DT.LOAI_PHI as "loaiPhi"
              from TC_HOC_PHI_DETAIL DT
                       LEFT JOIN TC_HOC_PHI HP
                                 on HP.MSSV = DT.MSSV and HP.NAM_HOC = DT.NAM_HOC and HP.HOC_KY = DT.HOC_KY
                       LEFT JOIN FW_STUDENT FS on DT.MSSV = FS.MSSV
              where DT.NAM_HOC = namHoc
                and DT.HOC_KY = hocKy
                and FS.NAM_TUYEN_SINH = namTuyenSinh
                AND FS.BAC_DAO_TAO = bac
                AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
                AND (nganh is null or FS.MA_NGANH = nganh)
              GROUP BY DT.LOAI_PHI) TD
                 LEFT JOIN TC_LOAI_PHI LP on LP.ID = TD."loaiPhi"
        ORDER BY TD."loaiPhi";
    return my_cursor;
END;

/
--EndMethod--

DROP FUNCTION TEST_SEARCH_PAGE;
/
--EndMethod--